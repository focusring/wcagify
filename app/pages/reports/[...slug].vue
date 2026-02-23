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
  title: () => (report.value ? `${report.value.title} - WCAGify` : 'WCAGify'),
  description: () => report.value?.description
})

const { data: issues } = await useAsyncData(`issues-${reportPath.value}`, () =>
  queryCollection('issues').where('path', 'LIKE', `${reportPath.value}/%`).all()
)

const reportIssues = computed(() =>
  (issues.value ?? [])
    .filter((issue) => issue.sc !== 'none')
    .sort((a, b) => a.sc.localeCompare(b.sc, undefined, { numeric: true }))
)

const { scName, scUri } = useWcagData()

const issuesBySc = computed(() => {
  const groups: {
    sc: string
    name: string
    uri: string
    issues: typeof reportIssues.value
  }[] = []
  const seen = new Map<string, number>()
  const wcagVersion = (report.value?.evaluation.targetWcagVersion ?? '2.2') as '2.0' | '2.1' | '2.2'
  const language = (report.value?.language === 'nl' ? 'nl' : 'en') as 'en' | 'nl'

  if (!report.value) return groups

  for (const issue of reportIssues.value) {
    const idx = seen.get(issue.sc)
    if (idx !== undefined) {
      groups[idx]!.issues.push(issue)
    } else {
      seen.set(issue.sc, groups.length)
      groups.push({
        sc: issue.sc,
        name: scName(issue.sc, wcagVersion, language),
        uri: scUri(issue.sc, wcagVersion, language),
        issues: [issue]
      })
    }
  }
  return groups
})

const reportTips = computed(() => (issues.value ?? []).filter((issue) => issue.sc === 'none'))

const sharedPath = computed(() => `/shared/${report.value?.language ?? 'nl'}/about-this-report`)

const { data: aboutThisReport } = await useAsyncData(`about-${sharedPath.value}`, () =>
  queryCollection('shared').path(sharedPath.value).first()
)
</script>

<template>
  <div v-if="report" class="mx-auto max-w-prose">
    <ReportHeader :report="report" :issues="issues ?? []" />

    <section id="executive-summary" class="mt-12">
      <h2 class="text-2xl font-semibold text-gray-950 dark:text-white">
        {{ t('report.executiveSummary') }}
      </h2>
      <div class="mt-4 prose dark:prose-invert">
        <ContentRenderer :value="report" />
      </div>
    </section>

    <hr class="my-12 border-gray-200 dark:border-gray-800" />

    <section id="scorecard">
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

    <hr class="my-12 border-gray-200 dark:border-gray-800" />

    <section v-if="aboutThisReport" id="about">
      <h2 class="text-2xl font-semibold text-gray-950 dark:text-white">
        {{ t('report.aboutThisReport') }}
      </h2>
      <div class="mt-4 prose dark:prose-invert">
        <ContentRenderer :value="aboutThisReport" />
      </div>
    </section>

    <hr v-if="aboutThisReport" class="my-12 border-gray-200 dark:border-gray-800" />

    <section id="scope">
      <h2 class="text-2xl font-semibold text-gray-950 dark:text-white">
        {{ t('report.scope') }}
      </h2>
      <div class="mt-4">
        <ReportScope :report="report" />
      </div>
    </section>

    <hr class="my-12 border-gray-200 dark:border-gray-800" />

    <section id="sample">
      <h2 class="text-2xl font-semibold text-gray-950 dark:text-white">
        {{ t('report.representativeSample') }}
      </h2>
      <div class="mt-4">
        <ReportSample :report="report" />
      </div>
    </section>

    <template v-if="issuesBySc.length">
      <hr class="my-12 border-gray-200 dark:border-gray-800" />

      <section id="issues">
        <h2 class="text-2xl font-semibold text-gray-950 dark:text-white">
          {{ t('report.issues') }}
        </h2>
        <div v-for="group in issuesBySc" :key="group.sc" class="mt-8">
          <h3 class="text-lg font-medium text-gray-950 dark:text-white">
            <a :href="group.uri" target="_blank" class="hover:underline">{{ group.name }}</a>
          </h3>
          <div class="mt-4 space-y-8">
            <ReportIssue
              v-for="issue in group.issues"
              :key="issue.path"
              :issue="issue"
              :report="report"
            />
          </div>
        </div>
      </section>
    </template>

    <template v-if="reportTips.length">
      <hr class="my-12 border-gray-200 dark:border-gray-800" />

      <section id="tips">
        <h2 class="text-2xl font-semibold text-gray-950 dark:text-white">
          {{ t('report.tips') }}
        </h2>
        <ol class="mt-6 list-decimal list-outside space-y-8 pl-6">
          <li v-for="tip in reportTips" :key="tip.path">
            <h3 class="font-medium text-gray-950 dark:text-white">
              {{ tip.title }}
            </h3>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {{ t('report.difficulty') }}: {{ tip.difficulty }}
            </p>
            <div class="mt-3 prose dark:prose-invert">
              <ContentRenderer :value="tip" />
            </div>
          </li>
        </ol>
      </section>
    </template>
  </div>
</template>
