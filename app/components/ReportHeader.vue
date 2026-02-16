<script setup lang="ts">
import type { ReportsCollectionItem } from '@nuxt/content'

defineProps<{
  report: ReportsCollectionItem
}>()

const { t } = useI18n()
</script>

<template>
  <UPageHero :title="t('report.accessibilityConformanceReportFor', { title: report.title })">
    <UPageGrid>
      <UPageCard :title="t('report.evaluatedBy')">
        <p>{{ report.evaluation.evaluator }}</p>
      </UPageCard>
      <UPageCard :title="t('report.commissionedBy')">
        <p>{{ report.evaluation.commissioner }}</p>
      </UPageCard>
      <UPageCard :title="t('report.target')">
        <p>{{ report.evaluation.target }}</p>
      </UPageCard>
      <UPageCard :title="t('report.date')">
        <p>{{ report.evaluation.date }}</p>
      </UPageCard>
      <UPageCard
        v-if="report.evaluation.specialRequirements"
        :title="t('report.specialRequirements')"
      >
        <p>{{ report.evaluation.specialRequirements }}</p>
      </UPageCard>
    </UPageGrid>
  </UPageHero>
</template>
