<script setup lang="ts">
import type { GuidelineGroup } from '@focusring/wcagify'
import type { IssuesCollectionItem, ReportsCollectionItem } from '@nuxt/content'

const props = defineProps<{
  guideline: GuidelineGroup<IssuesCollectionItem>
  report: ReportsCollectionItem
}>()

const open = ref(true)
</script>

<template>
  <div>
    <button class="flex w-full items-center justify-between py-2 text-left" @click="open = !open">
      <h3 class="text-lg font-medium text-gray-950 dark:text-white">
        {{ guideline.guideline }}: {{ guideline.name }}
      </h3>
      <Icon
        name="i-lucide-chevron-down"
        class="size-5 text-gray-400 transition-transform"
        :class="{ 'rotate-180': open }"
      />
    </button>

    <div v-show="open" class="mt-2 space-y-3">
      <ReportSuccessCriterion
        v-for="criterion in guideline.criteria"
        :key="criterion.sc"
        :criterion="criterion"
        :report="report"
      />
    </div>
  </div>
</template>
