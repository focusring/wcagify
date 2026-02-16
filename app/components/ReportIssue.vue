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
  <article class="border-l-2 border-gray-200 pl-6 dark:border-gray-800">
    <h3 class="text-lg font-medium text-gray-950 dark:text-white">
      {{ label }}
    </h3>
    <div class="mt-2 flex flex-wrap gap-2">
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
    <div class="mt-4 prose dark:prose-invert">
      <ContentRenderer :value="issue" />
    </div>
    <p
      v-if="!isTip"
      class="mt-4"
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
    </p>
  </article>
</template>
