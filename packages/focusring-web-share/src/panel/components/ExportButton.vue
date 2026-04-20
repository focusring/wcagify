<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../../composables/useI18n'
import { useExport, doExportZip } from '../../composables/useExport'
import type { CapturedPage, CdpNetworkRecord } from '../../types'
import type { ExportPageData } from '../../composables/useExport'

const props = defineProps<{
  pages: CapturedPage[]
  getHtml: (id: string) => string | undefined
  getRecords: (id: string) => CdpNetworkRecord[] | undefined
}>()

const { t } = useI18n()
const { getTotalSize } = useExport()

const sessionName = ref('')

const capturedCount = computed(() => props.pages.filter((p) => p.status === 'captured').length)

const canExport = computed(() => capturedCount.value > 0)

const totalSize = computed(() => getTotalSize(props.pages))

const defaultSessionName = computed(() => {
  if (props.pages.length === 0) return ''
  try {
    const firstUrl = new URL(props.pages[0]!.url)
    return firstUrl.hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
})

const isExporting = ref(false)

// Cache replay files so we only fetch once per session
let cachedReplayFiles: { sw: Uint8Array; ui: Uint8Array } | undefined = undefined

async function fetchReplayFiles(): Promise<{ sw: Uint8Array; ui: Uint8Array } | undefined> {
  if (cachedReplayFiles) return cachedReplayFiles
  try {
    const baseUrl = 'https://cdn.jsdelivr.net/npm/replaywebpage@2.4.4/'
    const [swResp, uiResp] = await Promise.all([fetch(`${baseUrl}sw.js`), fetch(`${baseUrl}ui.js`)])
    if (swResp.ok && uiResp.ok) {
      cachedReplayFiles = {
        sw: new Uint8Array(await swResp.arrayBuffer()),
        ui: new Uint8Array(await uiResp.arrayBuffer())
      }
      return cachedReplayFiles
    }
  } catch {
    // CDN fetch failed
  }
  return undefined
}

async function handleExport() {
  const name = sessionName.value.trim() || defaultSessionName.value || 'web-share'
  isExporting.value = true
  try {
    // Pre-resolve all data here — pass no callbacks to the export function
    // To avoid Rolldown minifier variable shadowing bugs
    const resolvedData: ExportPageData[] = []
    const capturedPages = props.pages.filter((p) => p.status === 'captured')
    for (const pg of capturedPages) {
      resolvedData.push({
        page: pg,
        html: props.getHtml(pg.id),
        records: props.getRecords(pg.id)
      })
    }

    // Fetch replayweb.page files for interactive captures
    const hasInteractive = capturedPages.some((p) => p.interactiveCaptured)
    let replayFiles: { sw: Uint8Array; ui: Uint8Array } | undefined = undefined
    if (hasInteractive) {
      replayFiles = await fetchReplayFiles()
    }

    await doExportZip(resolvedData, name, replayFiles)
  } finally {
    isExporting.value = false
  }
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
      :disabled="!canExport || isExporting"
      :loading="isExporting"
      icon="i-lucide-download"
      size="lg"
      block
      :ui="{ base: 'cursor-pointer selectable-focus' }"
    />
  </div>
</template>
