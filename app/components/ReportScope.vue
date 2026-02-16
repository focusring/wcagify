<script setup lang="ts">
import type { ReportsCollectionItem } from '@nuxt/content'

defineProps<{
  report: ReportsCollectionItem
}>()

const { t } = useI18n()
</script>

<template>
  <UPageGrid>
    <UPageCard :title="t('report.scopeItems')">
      <ul class="list-disc list-inside space-y-1">
        <li
          v-for="item in report.scope"
          :key="item"
        >
          {{ item }}
        </li>
      </ul>
    </UPageCard>

    <UPageCard
      v-if="report.outOfScope?.length"
      :title="t('report.notInScope')"
    >
      <ul class="list-disc list-inside space-y-1">
        <li
          v-for="item in report.outOfScope"
          :key="item"
        >
          {{ item }}
        </li>
      </ul>
    </UPageCard>

    <UPageCard :title="t('report.accessibilitySupport')">
      <p class="text-muted mb-3">
        {{ t('report.accessibilitySupportExplanation') }}
      </p>
      <ul class="list-disc list-inside space-y-1">
        <li
          v-for="item in report.baseline"
          :key="item"
        >
          {{ item }}
        </li>
      </ul>
    </UPageCard>

    <UPageCard :title="t('report.technologiesUsed')">
      <p class="text-muted mb-3">
        {{ t('report.technologiesExplanation') }}
      </p>
      <ul class="list-disc list-inside space-y-1">
        <li
          v-for="item in report.technologies"
          :key="item"
        >
          {{ item }}
        </li>
      </ul>
    </UPageCard>
  </UPageGrid>
</template>
