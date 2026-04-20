import { ref, watch } from 'vue'
import type { CapturedPage, CdpNetworkRecord } from '../types'
import { useCaptureInteractive } from './useCaptureInteractive'

const pages = ref<CapturedPage[]>([])
const isCapturing = ref(false)
const captureProgress = ref({ current: 0, total: 0 })

// In-memory stores (too large for chrome.storage.local)
const capturedHtml = new Map<string, string>()
const capturedRecords = new Map<string, CdpNetworkRecord[]>()

let ready = false
let loadPromise: Promise<void> | undefined = undefined

async function doLoad() {
  const result = await chrome.storage.local.get(['capturePages'])
  if (Array.isArray(result.capturePages)) {
    pages.value = result.capturePages.map((p: CapturedPage) => ({
      ...p,
      status: p.status === 'capturing' ? 'pending' : p.status,
      ...(p.status === 'captured'
        ? {
            status: 'pending' as const,
            staticSizeBytes: undefined,
            interactiveSizeBytes: undefined,
            staticCaptured: undefined,
            interactiveCaptured: undefined
          }
        : {})
    }))
  }
  ready = true
}

function load() {
  if (!loadPromise) loadPromise = doLoad()
  return loadPromise
}

// Persist metadata on changes
watch(
  pages,
  (val) => {
    if (!ready) return
    const metadata = val.map(({ ...page }) => ({
      id: page.id,
      url: page.url,
      title: page.title,
      faviconUrl: page.faviconUrl,
      addedAt: page.addedAt,
      status: page.status
    }))
    chrome.storage.local.set({ capturePages: metadata })
  },
  { deep: true }
)

function generateId(): string {
  return crypto.randomUUID().slice(0, 8)
}

function getContentScriptPath(): string {
  const manifest = chrome.runtime.getManifest()
  const cs = manifest.content_scripts?.[0]?.js?.[0]
  if (cs) return cs
  throw new Error('Content script not found in manifest')
}

async function injectCaptureAgent(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: [getContentScriptPath()]
  })
}

async function ensureCaptureAgent(tabId: number): Promise<void> {
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'ping' })
  } catch {
    await injectCaptureAgent(tabId)
  }
}

function waitForTabLoad(tabId: number): Promise<void> {
  return new Promise((resolve) => {
    // Check if already loaded
    chrome.tabs.get(tabId).then((tab) => {
      if (tab.status === 'complete') {
        resolve()
        return
      }
      // Otherwise wait for the update event
      function listener(updatedTabId: number, changeInfo: { status?: string }) {
        if (updatedTabId === tabId && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener)
          resolve()
        }
      }
      chrome.tabs.onUpdated.addListener(listener)
    })
  })
}

async function retrieveHtml(tabId: number): Promise<string> {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => (globalThis as any).__focusringCapturedHtml as string | null
  })
  const html = results?.[0]?.result
  if (!html) {
    throw new Error('Failed to retrieve captured HTML from tab')
  }
  return html
}

// ── Static capture (SingleFile) ──

async function captureStatic(
  pageId: string,
  tabId: number
): Promise<{ sizeBytes: number; html: string }> {
  await ensureCaptureAgent(tabId)

  const response = (await chrome.tabs.sendMessage(tabId, {
    type: 'start-capture',
    pageId
  })) as { status: string; sizeBytes?: number; errorMessage?: string }

  if (response.status !== 'captured') {
    throw new Error(response.errorMessage ?? 'Static capture failed')
  }

  const html = await retrieveHtml(tabId)
  return { sizeBytes: response.sizeBytes ?? html.length, html }
}

// ── Interactive capture (CDP/WARC) ──

async function captureInteractiveMode(
  tabId: number
): Promise<{ sizeBytes: number; records: CdpNetworkRecord[] }> {
  const { captureInteractive } = useCaptureInteractive()
  return captureInteractive(tabId)
}

// ── Public API ──

export function useCaptures() {
  load()

  function addCurrentPage(url: string, title: string, faviconUrl?: string) {
    if (pages.value.some((p) => p.url === url)) return false
    pages.value.push({
      id: generateId(),
      url,
      title,
      faviconUrl,
      addedAt: Date.now(),
      status: 'pending'
    })
    return true
  }

  function removePage(id: string) {
    pages.value = pages.value.filter((p) => p.id !== id)
    capturedHtml.delete(id)
    capturedRecords.delete(id)
  }

  function clearAll() {
    pages.value = []
    capturedHtml.clear()
    capturedRecords.clear()
  }

  async function captureAll() {
    const pending = pages.value.filter((p) => p.status === 'pending' || p.status === 'failed')
    if (pending.length === 0) return

    isCapturing.value = true
    captureProgress.value = { current: 0, total: pending.length }

    for (const page of pending) {
      if (!isCapturing.value) break

      page.status = 'capturing'
      page.errorMessage = undefined
      page.staticCaptured = undefined
      page.interactiveCaptured = undefined

      try {
        // Find or create the tab
        const tabs = await chrome.tabs.query({ url: page.url })
        let tabId: number | undefined = undefined

        if (tabs[0]?.id) {
          tabId = tabs[0].id
        } else {
          const newTab = await chrome.tabs.create({ url: page.url, active: false })
          tabId = newTab.id!
          await waitForTabLoad(tabId)
        }

        // Interactive FIRST (reloads page with network capture for full JS interactivity),
        // Then Static on the freshly loaded page (force-inject content script after reload)
        const errors: string[] = []

        // 1. Interactive capture (CDP — reloads page, captures ALL network traffic)
        try {
          const interactiveResult = await captureInteractiveMode(tabId)
          capturedRecords.set(page.id, interactiveResult.records)
          page.interactiveSizeBytes = interactiveResult.sizeBytes
          page.interactiveCaptured = true
        } catch (error) {
          page.interactiveCaptured = false
          errors.push(`Interactive: ${error instanceof Error ? error.message : String(error)}`)
        }

        // 2. Static capture (SingleFile on the freshly loaded DOM)
        //    Force-inject content script since the page was reloaded by interactive capture
        try {
          await injectCaptureAgent(tabId)
          // Small delay for content script to initialize
          await new Promise((resolve) => setTimeout(resolve, 300))
          const staticResult = await captureStatic(page.id, tabId)
          capturedHtml.set(page.id, staticResult.html)
          page.staticSizeBytes = staticResult.sizeBytes
          page.staticCaptured = true
        } catch (error) {
          page.staticCaptured = false
          errors.push(`Static: ${error instanceof Error ? error.message : String(error)}`)
        }

        // Page is "captured" if at least one mode succeeded
        if (page.staticCaptured || page.interactiveCaptured) {
          page.status = 'captured'
        } else {
          page.status = 'failed'
          page.errorMessage = errors.join(' | ')
        }
      } catch (error) {
        page.status = 'failed'
        page.errorMessage = error instanceof Error ? error.message : String(error)
      }

      captureProgress.value.current++
    }

    isCapturing.value = false
  }

  function cancelCapture() {
    isCapturing.value = false
    for (const page of pages.value) {
      if (page.status === 'capturing') {
        page.status = 'pending'
      }
    }
  }

  function getHtml(id: string): string | undefined {
    return capturedHtml.get(id)
  }

  function getRecords(id: string): CdpNetworkRecord[] | undefined {
    return capturedRecords.get(id)
  }

  return {
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
  }
}
