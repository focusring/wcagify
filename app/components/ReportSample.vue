<script setup lang="ts">
import type { ReportsCollectionItem } from '@nuxt/content'

defineProps<{
  report: ReportsCollectionItem
}>()

const { t } = useI18n()
</script>

<template>
  <ul class="grid gap-4 sm:grid-cols-2">
    <li
      v-for="page in report.sample"
      :key="page.id"
      class="rounded-lg border border-gray-200 p-4 dark:border-gray-800"
    >
      <p class="font-medium text-gray-950 dark:text-white">
        {{ page.title }}
      </p>
      <p
        v-if="page.description"
        class="mt-1 text-sm text-gray-500 dark:text-gray-400"
      >
        {{ page.description }}
      </p>
      <UButton
        :to="page.url"
        :label="page.url"
        target="_blank"
        variant="link"
        trailing-icon="i-lucide-external-link"
        :aria-label="`${page.title} (${t('report.externalLink')})`"
        class="mt-2 p-0"
      />
    </li>
  </ul>
</template>
