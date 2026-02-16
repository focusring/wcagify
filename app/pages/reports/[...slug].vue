<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()

const reportPath = computed(() => `/reports/${(route.params.slug as string[]).join('/')}`)

const { data: report } = await useAsyncData(`report-${reportPath.value}`, () =>
  queryCollection('reports').path(reportPath.value).first()
)

if (!report.value) {
  throw createError({ statusCode: 404, statusMessage: 'Report not found' })
}

const { data: issues } = await useAsyncData(`issues-${reportPath.value}`, () =>
  queryCollection('issues').where('path', 'LIKE', `${reportPath.value}/%`).all()
)

const sharedPath = computed(() => `/shared/${report.value?.language ?? 'nl'}/about-this-report`)

const { data: aboutThisReport } = await useAsyncData(`about-${sharedPath.value}`, () =>
  queryCollection('shared').path(sharedPath.value).first()
)
</script>

<template>
  <div v-if="report">
    <ReportHeader :report="report" />

    <UPageSection :title="t('report.executiveSummary')">
      <ContentRenderer :value="report" />
    </UPageSection>

    <UPageSection :title="t('report.resultsPerPrinciple')">
      <ReportScorecard
        :issues="issues ?? []"
        :target-level="report.evaluation.targetLevel"
        :wcag-version="report.evaluation.targetWcagVersion"
      />
    </UPageSection>

    <UPageSection
      v-if="aboutThisReport"
      :title="t('report.aboutThisReport')"
    >
      <ContentRenderer :value="aboutThisReport" />
    </UPageSection>
  </div>
</template>
