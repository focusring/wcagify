<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../composables/useI18n'
import { useExport } from '../../composables/useExport'
import type { CapturedPage } from '../../types'

const props = defineProps<{
  page: CapturedPage
}>()

const emit = defineEmits<{
  remove: [id: string]
}>()

const { t } = useI18n()
const { formatSize } = useExport()

const statusColor = computed(() => {
  switch (props.page.status) {
    case 'pending':
      return 'neutral' as const
    case 'capturing':
      return 'info' as const
    case 'captured':
      return 'success' as const
    case 'failed':
      return 'error' as const
    default:
      return 'neutral' as const
  }
})

const statusLabel = computed(() => {
  switch (props.page.status) {
    case 'pending':
      return t('pages.pending')
    case 'capturing':
      return t('pages.capturing')
    case 'captured':
      return t('pages.captured')
    case 'failed':
      return t('pages.failed')
    default:
      return props.page.status
  }
})

const statusIcon = computed(() => {
  switch (props.page.status) {
    case 'pending':
      return 'i-lucide-clock'
    case 'capturing':
      return 'i-lucide-loader'
    case 'captured':
      return 'i-lucide-check-circle'
    case 'failed':
      return 'i-lucide-x-circle'
    default:
      return 'i-lucide-circle'
  }
})

const truncatedUrl = computed(() => {
  try {
    const url = new URL(props.page.url)
    const path = url.pathname + url.search
    return path.length > 50 ? path.slice(0, 47) + '...' : path
  } catch {
    return props.page.url
  }
})
</script>

<template>
  <li class="flex items-start gap-3 p-3 rounded-sm bg-elevated">
    <div class="flex-1 min-w-0 space-y-1">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-black dark:text-white truncate">
          {{ page.title }}
        </span>
      </div>
      <p class="text-xs text-muted truncate" :title="page.url">
        {{ truncatedUrl }}
      </p>
      <div class="flex items-center gap-2">
        <UBadge :color="statusColor" :icon="statusIcon" size="sm" variant="subtle">
          {{ statusLabel }}
        </UBadge>
        <span v-if="page.sizeBytes" class="text-xs text-muted">
          {{ formatSize(page.sizeBytes) }}
        </span>
      </div>
      <p v-if="page.errorMessage" class="text-xs text-red-600 dark:text-red-400">
        {{ page.errorMessage }}
      </p>
    </div>
    <UButton
      @click="emit('remove', page.id)"
      :aria-label="t('pages.remove')"
      icon="i-lucide-x"
      size="sm"
      color="neutral"
      variant="ghost"
      :ui="{ base: 'cursor-pointer selectable-focus' }"
    />
  </li>
</template>
