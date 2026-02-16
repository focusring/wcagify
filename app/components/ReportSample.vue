<script setup lang="ts">
import type { ReportsCollectionItem } from '@nuxt/content'

defineProps<{
  report: ReportsCollectionItem
}>()

const { t } = useI18n()
</script>

<template>
  <UPageGrid>
    <UPageCard
      v-for="page in report.sample"
      :key="page.id"
      :title="page.title"
      :description="page.description"
    >
      <template #footer>
        <UButton
          :to="page.url"
          :label="page.url"
          target="_blank"
          variant="link"
          trailing-icon="i-lucide-external-link"
          :aria-label="`${page.title} (${t('report.externalLink')})`"
          class="p-0"
        />
      </template>
    </UPageCard>
  </UPageGrid>
</template>
