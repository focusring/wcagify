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
  <div class="space-y-4">
    <p class="text-lg font-medium text-gray-950 dark:text-white">
      {{ t('report.conformanceLevel', { level: targetLevel, conforming: data.conforming.all, total: data.totals.all }) }}
    </p>
    <table class="w-full text-sm text-left">
      <caption class="sr-only">
        {{ t('report.resultsPerPrinciple') }}
      </caption>
      <thead>
        <tr class="border-b border-gray-200 dark:border-gray-800">
          <th scope="col" class="py-2 pr-4 font-medium text-gray-950 dark:text-white">
            {{ t('report.principle') }}
          </th>
          <th scope="col" class="py-2 font-medium text-gray-950 dark:text-white">
            {{ t('report.result') }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="principle in principles"
          :key="principle"
          class="border-b border-gray-100 dark:border-gray-900"
        >
          <td class="py-2 pr-4 text-gray-700 dark:text-gray-300">
            {{ t(`report.principles.${principle}`) }}
          </td>
          <td class="py-2 text-gray-700 dark:text-gray-300">
            {{ t('report.criteriaMet', { conforming: data.conforming[principle], total: data.totals[principle] }) }}
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="border-t border-gray-200 dark:border-gray-800">
          <th scope="row" class="py-2 pr-4 font-medium text-gray-950 dark:text-white">
            {{ t('report.total') }}
          </th>
          <td class="py-2 font-medium text-gray-950 dark:text-white">
            {{ t('report.criteriaMet', { conforming: data.conforming.all, total: data.totals.all }) }}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>
