<script setup lang="ts">
const { t } = useI18n()
const { data: reports } = await useAsyncData('reports', () =>
  queryCollection('reports').all()
)
</script>

<template>
  <div>
    <UPageHero
      :title="t('app.title')"
      :description="t('app.description')"
    />

    <UPageSection :title="t('app.reports')">
      <UPageGrid v-if="reports?.length">
        <ReportCard
          v-for="report in reports"
          :key="report.path"
          :report="report"
        />
      </UPageGrid>

      <p
        v-else
        class="text-muted"
      >
        {{ t('app.noReports') }}
      </p>
    </UPageSection>
  </div>
</template>
