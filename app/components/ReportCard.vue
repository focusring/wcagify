<script setup lang="ts">
import type { ReportsCollectionItem } from '@nuxt/content'

defineProps<{
  report: ReportsCollectionItem
}>()

const localePath = useLocalePath()
</script>

<template>
  <UPageCard
    :title="report.title"
    :description="report.evaluation.evaluator"
    :to="localePath(report.path)"
  >
    <template #footer>
      <div class="flex items-center justify-between gap-2">
        <time class="text-sm text-muted">
          {{ report.evaluation.date }}
        </time>
        <UBadge
          :label="report.evaluation.targetLevel"
          variant="subtle"
          size="sm"
        />
      </div>
    </template>
  </UPageCard>
</template>
