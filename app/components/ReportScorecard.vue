<script setup lang="ts">
import type { IssuesCollectionItem } from '@nuxt/content'

const props = defineProps<{
  issues: IssuesCollectionItem[]
  targetLevel: string
  wcagVersion: string
}>()

const { t } = useI18n()
const { scorecard } = useWcagData()

const data = computed(() => scorecard(props.issues, props.targetLevel as 'A' | 'AA' | 'AAA', props.wcagVersion as '2.0' | '2.1' | '2.2'))

const principles = ['perceivable', 'operable', 'understandable', 'robust'] as const
</script>

<template>
  <div class="space-y-2">
    <p class="text-lg font-medium text-gray-950 dark:text-white">
      {{ t('report.conformanceLevel', { level: targetLevel, conforming: data.conforming.all, total: data.totals.all }) }}
    </p>
    <dl class="mt-4 space-y-1 text-sm text-gray-700 dark:text-gray-300">
      <div
        v-for="principle in principles"
        :key="principle"
        class="flex gap-1"
      >
        <dt class="after:content-[':']">
          {{ t(`report.principles.${principle}`) }}
        </dt>
        <dd>{{ t('report.criteriaMet', { conforming: data.conforming[principle], total: data.totals[principle] }) }}</dd>
      </div>
    </dl>
  </div>
</template>
