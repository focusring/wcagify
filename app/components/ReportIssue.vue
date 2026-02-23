<script setup lang="ts">
import type { IssuesCollectionItem, ReportsCollectionItem } from '@nuxt/content'

const props = defineProps<{
  issue: IssuesCollectionItem
  report: ReportsCollectionItem
}>()

const { t } = useI18n()

const samplePage = computed(() =>
  props.report.sample.find(page => page.id === props.issue.sample)
)
</script>

<template>
  <article :id="`issue-${issue.path.split('/').pop()}`">
    <h4 class="font-medium text-gray-950 dark:text-white">
      {{ issue.title }}
    </h4>
    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
      {{ t('report.severity') }}: {{ issue.severity }}
      &middot;
      {{ t('report.difficulty') }}: {{ issue.difficulty }}
      <template v-if="samplePage">
        &middot;
        {{ t('report.sample') }}: {{ samplePage.title }}
      </template>
    </p>
    <div class="mt-3 prose dark:prose-invert">
      <ContentRenderer :value="issue" />
    </div>
  </article>
</template>
