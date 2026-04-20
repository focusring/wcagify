<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../../composables/useI18n'
import { useCaptures } from '../../composables/useCaptures'
import EmptyState from './EmptyState.vue'
import PageListItem from './PageListItem.vue'
import CaptureProgress from './CaptureProgress.vue'
import ExportButton from './ExportButton.vue'

const { t } = useI18n()
const {
  pages,
  isCapturing,
  captureProgress,
  addCurrentPage,
  removePage,
  clearAll,
  captureAll,
  cancelCapture,
  getHtml,
  getRecords
} = useCaptures()

const duplicateWarning = ref(false)

async function handleAddCurrentPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.url || !tab.title) return

  const added = addCurrentPage(tab.url, tab.title, tab.favIconUrl)
  if (!added) {
    duplicateWarning.value = true
    setTimeout(() => {
      duplicateWarning.value = false
    }, 2000)
  }
}

const hasPendingOrFailed = computed(() =>
  pages.value.some((p) => p.status === 'pending' || p.status === 'failed')
)

const hasCaptured = computed(() => pages.value.some((p) => p.status === 'captured'))
</script>

<template>
  <div class="space-y-4">
    <!-- Add Current Page button -->
    <UButton
      @click="handleAddCurrentPage"
      :label="t('pages.addCurrent')"
      icon="i-lucide-plus"
      size="lg"
      block
      color="primary"
      :ui="{ base: 'cursor-pointer selectable-focus' }"
    />

    <!-- Duplicate warning -->
    <p
      v-if="duplicateWarning"
      class="text-sm text-orange-600 dark:text-orange-400 text-center"
      role="alert"
    >
      {{ t('pages.alreadyAdded') }}
    </p>

    <!-- Empty state -->
    <EmptyState v-if="pages.length === 0" />

    <!-- Page list -->
    <template v-else>
      <ul class="space-y-2" role="list">
        <PageListItem v-for="page in pages" :key="page.id" :page="page" @remove="removePage" />
      </ul>

      <!-- Capture progress -->
      <CaptureProgress
        v-if="isCapturing"
        :current="captureProgress.current"
        :total="captureProgress.total"
        @cancel="cancelCapture"
      />

      <!-- Action buttons -->
      <div class="flex gap-2">
        <UButton
          v-if="hasPendingOrFailed"
          @click="captureAll"
          :label="t('pages.captureAll')"
          :disabled="isCapturing"
          icon="i-lucide-camera"
          size="lg"
          class="flex-1 selectable-focus"
          :ui="{ base: 'cursor-pointer' }"
        />
        <UButton
          @click="clearAll"
          :label="t('pages.clearAll')"
          :disabled="isCapturing"
          icon="i-lucide-trash-2"
          size="lg"
          color="neutral"
          variant="subtle"
          :ui="{ base: 'cursor-pointer selectable-focus' }"
        />
      </div>

      <!-- Export section -->
      <ExportButton
        v-if="hasCaptured"
        :pages="pages"
        :get-html="getHtml"
        :get-records="getRecords"
      />
    </template>
  </div>
</template>
