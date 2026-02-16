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

useSeoMeta({
  title: () => report.value ? `${report.value.title} - WCAGify` : 'WCAGify',
  description: () => report.value?.description
})

const { data: issues } = await useAsyncData(`issues-${reportPath.value}`, () =>
  queryCollection('issues').where('path', 'LIKE', `${reportPath.value}/%`).all()
)

const reportIssues = computed(() =>
  (issues.value ?? [])
    .filter(issue => issue.sc !== 'none')
    .sort((a, b) => a.sc.localeCompare(b.sc, undefined, { numeric: true }))
)

const reportTips = computed(() =>
  (issues.value ?? [])
    .filter(issue => issue.sc === 'none')
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

    <UPageSection :title="t('report.scope')">
      <ReportScope :report="report" />
    </UPageSection>

    <UPageSection :title="t('report.representativeSample')">
      <ReportSample :report="report" />
    </UPageSection>

    <UPageSection
      v-if="reportIssues.length"
      :title="t('report.issues')"
    >
      <UPageGrid>
        <ReportIssue
          v-for="(issue, i) in reportIssues"
          :key="issue.path"
          :issue="issue"
          :index="i + 1"
          :is-tip="false"
          :report="report"
        />
      </UPageGrid>
    </UPageSection>

    <UPageSection
      v-if="reportTips.length"
      :title="t('report.tips')"
    >
      <UPageGrid>
        <ReportIssue
          v-for="(tip, i) in reportTips"
          :key="tip.path"
          :issue="tip"
          :index="i + 1"
          :is-tip="true"
          :report="report"
        />
      </UPageGrid>
    </UPageSection>
  </div>
</template>
