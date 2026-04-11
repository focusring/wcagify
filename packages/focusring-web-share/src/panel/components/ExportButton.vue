<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../../composables/useI18n'
import { useExport } from '../../composables/useExport'
import type { CapturedPage } from '../../types'

const props = defineProps<{
  pages: CapturedPage[]
  getHtml: (id: string) => string | undefined
}>()

const { t } = useI18n()
const { exportZip, getTotalSize } = useExport()

const sessionName = ref('')

const capturedCount = computed(() => props.pages.filter((p) => p.status === 'captured').length)

const canExport = computed(() => capturedCount.value > 0)

const totalSize = computed(() => getTotalSize(props.pages))

const defaultSessionName = computed(() => {
  if (props.pages.length === 0) return ''
  try {
    const url = new URL(props.pages[0]!.url)
    return url.hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
})

function handleExport() {
  const name = sessionName.value.trim() || defaultSessionName.value || 'web-share'
  exportZip(props.pages, name, props.getHtml)
}
</script>

<template>
  <div class="space-y-3 pt-2">
    <USeparator />

    <UFormField :label="t('pages.sessionName')" :ui="{ label: 'label-title' }">
      <UInput
        v-model="sessionName"
        :placeholder="defaultSessionName || t('pages.sessionNamePlaceholder')"
        size="lg"
        class="selectable-focus"
      />
    </UFormField>

    <div class="flex items-center justify-between text-sm text-muted">
      <span>{{ t('pages.exportReady', { count: capturedCount }) }}</span>
      <span v-if="canExport">{{ t('pages.totalSize', { size: totalSize }) }}</span>
    </div>

    <UButton
      @click="handleExport"
      :label="t('pages.exportZip')"
      :disabled="!canExport"
      icon="i-lucide-download"
      size="lg"
      block
      :ui="{ base: 'cursor-pointer selectable-focus' }"
    />
  </div>
</template>
