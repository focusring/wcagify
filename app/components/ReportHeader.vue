<script setup lang="ts">
import type { ReportsCollectionItem } from '@nuxt/content'

defineProps<{
  report: ReportsCollectionItem
}>()

const { t } = useI18n()
</script>

<template>
  <header class="py-12">
    <h1 class="text-4xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-5xl">
      {{ t('report.accessibilityConformanceReportFor', { title: report.title }) }}
    </h1>
    <dl class="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
      <div>
        <dt class="text-gray-500 dark:text-gray-400">
          {{ t('report.evaluatedBy') }}
        </dt>
        <dd class="mt-0.5 text-gray-950 dark:text-white">
          {{ report.evaluation.evaluator }}
        </dd>
      </div>
      <div>
        <dt class="text-gray-500 dark:text-gray-400">
          {{ t('report.commissionedBy') }}
        </dt>
        <dd class="mt-0.5 text-gray-950 dark:text-white">
          {{ report.evaluation.commissioner }}
        </dd>
      </div>
      <div>
        <dt class="text-gray-500 dark:text-gray-400">
          {{ t('report.target') }}
        </dt>
        <dd class="mt-0.5 text-gray-950 dark:text-white">
          {{ report.evaluation.target }}
        </dd>
      </div>
      <div>
        <dt class="text-gray-500 dark:text-gray-400">
          {{ t('report.date') }}
        </dt>
        <dd class="mt-0.5 text-gray-950 dark:text-white">
          {{ report.evaluation.date }}
        </dd>
      </div>
      <div>
        <dt class="text-gray-500 dark:text-gray-400">
          {{ t('report.level') }}
        </dt>
        <dd class="mt-0.5 text-gray-950 dark:text-white">
          WCAG {{ report.evaluation.targetWcagVersion }} {{ report.evaluation.targetLevel }}
        </dd>
      </div>
      <div v-if="report.evaluation.specialRequirements">
        <dt class="text-gray-500 dark:text-gray-400">
          {{ t('report.specialRequirements') }}
        </dt>
        <dd class="mt-0.5 text-gray-950 dark:text-white">
          {{ report.evaluation.specialRequirements }}
        </dd>
      </div>
    </dl>
  </header>
</template>
