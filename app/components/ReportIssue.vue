<script setup lang="ts">
import type { IssuesCollectionItem, ReportsCollectionItem } from '@nuxt/content'

const props = defineProps<{
  issue: IssuesCollectionItem
  index: number
  isTip: boolean
  report: ReportsCollectionItem
}>()

const { t } = useI18n()
const { scUri, scName } = useWcagData()

const label = computed(() => {
  const prefix = props.isTip ? t('report.tip') : t('report.issue')
  return `${prefix} ${props.index}: ${props.issue.title}`
})

const wcagVersion = computed(() => props.report.evaluation.targetWcagVersion as '2.0' | '2.1' | '2.2')
const language = computed(() => (props.report.language === 'nl' ? 'nl' : 'en') as 'en' | 'nl')

const criterionUri = computed(() => scUri(props.issue.sc, wcagVersion.value, language.value))
const criterionName = computed(() => scName(props.issue.sc, wcagVersion.value, language.value))

const severityColor = computed(() => {
  const map: Record<string, 'error' | 'warning' | 'success'> = {
    High: 'error',
    Medium: 'warning',
    Low: 'success'
  }
  return map[props.issue.severity] ?? 'neutral'
})

const difficultyColor = computed(() => {
  const map: Record<string, 'error' | 'warning' | 'success'> = {
    High: 'error',
    Medium: 'warning',
    Low: 'success'
  }
  return map[props.issue.difficulty] ?? 'neutral'
})

const samplePage = computed(() =>
  props.report.sample.find(page => page.id === props.issue.sample)
)
</script>

<template>
  <UPageCard>
    <template #title>
      {{ label }}
    </template>

    <template #description>
      <div class="flex flex-wrap gap-2 mt-1">
        <template v-if="!isTip">
          <UBadge
            :label="`${t('report.severity')}: ${issue.severity}`"
            :color="severityColor"
            variant="subtle"
          />
          <UBadge
            :label="`${t('report.difficulty')}: ${issue.difficulty}`"
            :color="difficultyColor"
            variant="subtle"
          />
        </template>
        <UBadge
          v-if="samplePage"
          :label="samplePage.title"
          color="neutral"
          variant="subtle"
        />
      </div>
    </template>

    <ContentRenderer :value="issue" />

    <template
      v-if="!isTip"
      #footer
    >
      <UButton
        :to="criterionUri"
        :label="criterionName"
        target="_blank"
        variant="link"
        trailing-icon="i-lucide-external-link"
        :aria-label="`${criterionName} (${t('report.externalLink')})`"
        class="p-0"
      />
    </template>
  </UPageCard>
</template>
