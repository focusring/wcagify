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
  <article
    v-if="report"
    class="mx-auto max-w-prose"
  >
    <ReportHeader :report="report" />

    <section class="mt-12">
      <h2 class="text-2xl font-semibold text-gray-950 dark:text-white">
        {{ t('report.executiveSummary') }}
      </h2>
      <div class="mt-4 prose dark:prose-invert">
        <ContentRenderer :value="report" />
      </div>
    </section>

    <hr class="my-12 border-gray-200 dark:border-gray-800">

    <section>
      <h2 class="text-2xl font-semibold text-gray-950 dark:text-white">
        {{ t('report.resultsPerPrinciple') }}
      </h2>
      <div class="mt-4">
        <ReportScorecard
          :issues="issues ?? []"
          :target-level="report.evaluation.targetLevel"
          :wcag-version="report.evaluation.targetWcagVersion"
        />
      </div>
    </section>

    <hr class="my-12 border-gray-200 dark:border-gray-800">

    <section v-if="aboutThisReport">
      <h2 class="text-2xl font-semibold text-gray-950 dark:text-white">
        {{ t('report.aboutThisReport') }}
      </h2>
      <div class="mt-4 prose dark:prose-invert">
        <ContentRenderer :value="aboutThisReport" />
      </div>
    </section>

    <hr
      v-if="aboutThisReport"
      class="my-12 border-gray-200 dark:border-gray-800"
    >

    <section>
      <h2 class="text-2xl font-semibold text-gray-950 dark:text-white">
        {{ t('report.scope') }}
      </h2>
      <div class="mt-4">
        <ReportScope :report="report" />
      </div>
    </section>

    <hr class="my-12 border-gray-200 dark:border-gray-800">

    <section>
      <h2 class="text-2xl font-semibold text-gray-950 dark:text-white">
        {{ t('report.representativeSample') }}
      </h2>
      <div class="mt-4">
        <ReportSample :report="report" />
      </div>
    </section>

    <template v-if="reportIssues.length">
      <hr class="my-12 border-gray-200 dark:border-gray-800">

      <section>
        <h2 class="text-2xl font-semibold text-gray-950 dark:text-white">
          {{ t('report.issues') }}
        </h2>
        <div class="mt-6 space-y-8">
          <ReportIssue
            v-for="(issue, i) in reportIssues"
            :key="issue.path"
            :issue="issue"
            :index="i + 1"
            :is-tip="false"
            :report="report"
          />
        </div>
      </section>
    </template>

    <template v-if="reportTips.length">
      <hr class="my-12 border-gray-200 dark:border-gray-800">

      <section>
        <h2 class="text-2xl font-semibold text-gray-950 dark:text-white">
          {{ t('report.tips') }}
        </h2>
        <div class="mt-6 space-y-8">
          <ReportIssue
            v-for="(tip, i) in reportTips"
            :key="tip.path"
            :issue="tip"
            :index="i + 1"
            :is-tip="true"
            :report="report"
          />
        </div>
      </section>
    </template>
  </article>
</template>
