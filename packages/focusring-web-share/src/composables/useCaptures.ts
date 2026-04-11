import { ref, watch } from 'vue'
import type { CapturedPage } from '../types'

const pages = ref<CapturedPage[]>([])
const isCapturing = ref(false)
const captureProgress = ref({ current: 0, total: 0 })

// In-memory store for captured HTML (too large for chrome.storage.local)
const capturedHtml = new Map<string, string>()

let ready = false
let loadPromise: Promise<void> | null = null

async function doLoad() {
  const result = await chrome.storage.local.get(['capturePages'])
  if (Array.isArray(result.capturePages)) {
    pages.value = result.capturePages.map((p: CapturedPage) => ({
      ...p,
      // Reset capturing states from previous sessions
      status: p.status === 'capturing' ? 'pending' : p.status,
      // HTML is not persisted, so reset captured pages to pending
      ...(p.status === 'captured' ? { status: 'pending' as const, sizeBytes: undefined } : {})
    }))
  }
  ready = true
}

function load() {
  if (!loadPromise) loadPromise = doLoad()
  return loadPromise
}

// Persist metadata (not HTML) on changes
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

// Listen for capture results from content script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'capture-complete') {
    const page = pages.value.find((p) => p.id === message.pageId)
    if (page) {
      page.status = 'captured'
      page.sizeBytes = message.sizeBytes
      capturedHtml.set(page.id, message.html)
    }
  }
  if (message.type === 'capture-failed') {
    const page = pages.value.find((p) => p.id === message.pageId)
    if (page) {
      page.status = 'failed'
      page.errorMessage = message.errorMessage
    }
  }
})

function generateId(): string {
  return crypto.randomUUID().slice(0, 8)
}

function waitForTabLoad(tabId: number): Promise<void> {
  return new Promise((resolve) => {
    function listener(updatedTabId: number, changeInfo: { status?: string }) {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener)
        resolve()
      }
    }
    chrome.tabs.onUpdated.addListener(listener)
  })
}

function waitForCaptureResult(pageId: string): Promise<void> {
  return new Promise((resolve) => {
    const check = () => {
      const page = pages.value.find((p) => p.id === pageId)
      if (page && (page.status === 'captured' || page.status === 'failed')) {
        resolve()
      } else {
        setTimeout(check, 200)
      }
    }
    check()
  })
}

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
  }

  function clearAll() {
    pages.value = []
    capturedHtml.clear()
  }

  async function captureAll() {
    const pending = pages.value.filter((p) => p.status === 'pending' || p.status === 'failed')
    if (pending.length === 0) return

    isCapturing.value = true
    captureProgress.value = { current: 0, total: pending.length }

    for (const page of pending) {
      if (!isCapturing.value) break // cancelled

      page.status = 'capturing'
      page.errorMessage = undefined

      try {
        // Find the tab with this URL
        const tabs = await chrome.tabs.query({ url: page.url })
        let tabId: number | undefined

        if (tabs[0]?.id) {
          tabId = tabs[0].id
        } else {
          // Open the page in a new tab
          const newTab = await chrome.tabs.create({ url: page.url, active: false })
          tabId = newTab.id!
          await waitForTabLoad(tabId)
          // Small delay to ensure content script is injected
          await new Promise((r) => setTimeout(r, 500))
        }

        await chrome.tabs.sendMessage(tabId, {
          type: 'start-capture',
          pageId: page.id
        })

        await waitForCaptureResult(page.id)
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
    // Reset any capturing pages back to pending
    for (const page of pages.value) {
      if (page.status === 'capturing') {
        page.status = 'pending'
      }
    }
  }

  function getHtml(id: string): string | undefined {
    return capturedHtml.get(id)
  }

  return {
    pages,
    isCapturing,
    captureProgress,
    capturedHtml,
    addCurrentPage,
    removePage,
    clearAll,
    captureAll,
    cancelCapture,
    getHtml
  }
}
