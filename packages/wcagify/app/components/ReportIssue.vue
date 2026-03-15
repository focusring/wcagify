<script setup lang="ts">
import type { IssuesCollectionItem, ReportsCollectionItem } from '@nuxt/content'

const props = defineProps<{
  issue: IssuesCollectionItem
  report: ReportsCollectionItem
  scName: string
  index?: number
}>()

const { t } = useI18n()
const { resolveSamplePage } = useWcagData()

const samplePage = computed(() => resolveSamplePage(props.report.sample, props.issue.sample))

const open = ref(false)

const severityColor = {
  low: 'success',
  medium: 'warning',
  high: 'error'
} as const

type BadgeColor = 'error' | 'neutral' | 'success' | 'warning' | 'primary' | 'secondary' | 'info'

function getSeverityColor(severity: string): BadgeColor {
  return (severityColor[severity.toLowerCase() as keyof typeof severityColor] ??
    'neutral') as BadgeColor
}
</script>

<template>
  <article :id="`issue-${issue.path.split('/').filter(Boolean).pop() || issue.path}`">
    <button class="flex w-full items-center gap-3 text-left" @click="open = !open">
      <span class="font-medium text-gray-950 dark:text-white">
        <span v-if="index">{{ index }}. </span>{{ issue.title }}
      </span>

      <div class="ml-auto flex items-center gap-2 shrink-0">
        <UBadge v-if="samplePage" :label="samplePage.title" variant="outline" color="neutral" />
        <UBadge
          :label="t(`report.severityLevel.${issue.severity.toLowerCase()}`)"
          variant="subtle"
          :color="getSeverityColor(issue.severity)"
        />
        <UBadge
          :label="t('report.scStatus.failed')"
          variant="subtle"
          color="error"
          icon="i-lucide-x"
        />
        <Icon
          name="i-lucide-chevron-down"
          class="size-5 text-gray-400 transition-transform"
          :class="{ 'rotate-180': open }"
        />
      </div>
    </button>

    <div v-show="open" class="mt-3 pl-4">
      <dl class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
        <div class="flex gap-1">
          <dt>{{ t('report.successCriterion') }}:</dt>
          <dd>{{ scName }}</dd>
        </div>
        <div class="flex gap-1">
          <dt>{{ t('report.difficulty') }}:</dt>
          <dd>{{ t(`report.difficultyLevel.${issue.difficulty.toLowerCase()}`) }}</dd>
        </div>
        <div v-if="samplePage" class="flex gap-1">
          <dt>{{ t('report.sample') }}:</dt>
          <dd>{{ samplePage.title }}</dd>
        </div>
      </dl>
      <div class="mt-3 prose dark:prose-invert">
        <ContentRenderer :value="issue" />
      </div>
    </div>
  </article>
</template>
