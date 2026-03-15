<script setup lang="ts">
import type { ScGroup, ScStatus } from '@focusring/wcagify'
import type { IssuesCollectionItem, ReportsCollectionItem } from '@nuxt/content'

const props = defineProps<{
  criterion: ScGroup<IssuesCollectionItem>
  report: ReportsCollectionItem
}>()

const { t } = useI18n()

const open = ref(false)

type BadgeColor = 'error' | 'neutral' | 'success' | 'warning' | 'primary' | 'secondary' | 'info'

const statusColors: Record<ScStatus, BadgeColor> = {
  passed: 'success',
  failed: 'error',
  'not-present': 'neutral',
  'not-tested': 'warning'
}

const levelColors: Record<string, BadgeColor> = {
  A: 'primary',
  AA: 'primary',
  AAA: 'primary'
}
</script>

<template>
  <div class="rounded-lg border border-gray-200 dark:border-gray-800">
    <button class="flex w-full items-center gap-3 px-4 py-3 text-left" @click="open = !open">
      <UBadge
        :label="criterion.level"
        variant="subtle"
        :color="levelColors[criterion.level] ?? 'primary'"
        class="shrink-0"
      />

      <a
        :href="criterion.uri"
        target="_blank"
        class="font-medium text-gray-950 dark:text-white hover:underline"
        @click.stop
      >
        {{ criterion.name }}
      </a>

      <div class="ml-auto flex items-center gap-2 shrink-0">
        <UBadge
          :label="t(`report.scStatus.${criterion.status}`)"
          variant="subtle"
          :color="statusColors[criterion.status]"
        />

        <Icon
          v-if="criterion.issues.length > 0"
          name="i-lucide-chevron-down"
          class="size-5 text-gray-400 transition-transform"
          :class="{ 'rotate-180': open }"
        />
      </div>
    </button>

    <div
      v-if="criterion.issues.length > 0 && open"
      class="border-t border-gray-200 dark:border-gray-800 px-4 py-4 space-y-6"
    >
      <ReportIssue
        v-for="(issue, index) in criterion.issues"
        :key="issue.path"
        :issue="issue"
        :report="report"
        :sc-name="criterion.name"
        :index="index + 1"
      />
    </div>
  </div>
</template>
