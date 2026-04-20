import type { CdpNetworkRecord } from '../types'

// ── Icon theming ──

function updateIcon(isDark: boolean) {
  const prefix = isDark ? 'light' : 'dark'
  chrome.action.setIcon({
    path: {
      '16': `src/assets/focusring-${prefix}-16.png`,
      '48': `src/assets/focusring-${prefix}-48.png`
    }
  })
}

if (globalThis.matchMedia) {
  const mq = globalThis.matchMedia('(prefers-color-scheme: dark)')
  updateIcon(mq.matches)
  mq.addEventListener('change', (e) => updateIcon(e.matches))
}

// ── Side panel ──

chrome.action.onClicked.addListener((tab) => {
  if (tab.windowId) {
    chrome.sidePanel.open({ windowId: tab.windowId })
  }
})

// ── Interactive capture via CDP Network domain ──
// Reloads the page and captures ALL network responses (HTML, CSS, JS, images, API responses).
// Uses Network.responseReceived + Network.getResponseBody (no Fetch interception).

const NETWORK_IDLE_MS = 5000
const CAPTURE_TIMEOUT_MS = 60_000

interface PendingResponse {
  url: string
  method: string
  statusCode: number
  statusText: string
  responseHeaders: Record<string, string>
  timestamp: number
}

async function captureInteractive(
  tabId: number
): Promise<{ records: CdpNetworkRecord[]; sizeBytes: number }> {
  const completedRecords: CdpNetworkRecord[] = []
  const pendingResponses = new Map<string, PendingResponse>()

  let networkIdleTimer: ReturnType<typeof setTimeout> | undefined = undefined
  let resolveCapture: (() => void) | undefined = undefined

  function resetIdleTimer() {
    if (networkIdleTimer) clearTimeout(networkIdleTimer)
    networkIdleTimer = setTimeout(() => resolveCapture?.(), NETWORK_IDLE_MS)
  }

  await chrome.debugger.attach({ tabId }, '1.3')

  try {
    const eventHandler = (
      source: chrome.debugger.Debuggee,
      method: string,
      params: Record<string, any> | undefined
    ) => {
      if (source.tabId !== tabId || !params) return

      if (method === 'Network.requestWillBeSent') {
        resetIdleTimer()
      }

      if (method === 'Network.responseReceived') {
        const resp = params.response
        if (resp) {
          pendingResponses.set(params.requestId, {
            url: resp.url ?? '',
            method: params.type === 'Document' ? 'GET' : 'GET',
            statusCode: resp.status ?? 200,
            statusText: resp.statusText ?? 'OK',
            responseHeaders: resp.headers ?? {},
            timestamp: params.timestamp ?? Date.now() / 1000
          })
        }
        resetIdleTimer()
      }

      if (method === 'Network.loadingFinished') {
        const pending = pendingResponses.get(params.requestId)
        if (pending) {
          pendingResponses.delete(params.requestId)
          // Eagerly fetch body while debugger is attached
          fetchBody({ tabId, requestId: params.requestId, pending, records: completedRecords })
        }
        resetIdleTimer()
      }

      if (method === 'Network.loadingFailed') {
        pendingResponses.delete(params.requestId)
        resetIdleTimer()
      }
    }

    chrome.debugger.onEvent.addListener(eventHandler)

    try {
      await chrome.debugger.sendCommand({ tabId }, 'Network.enable', {})

      // Reload the page — uses existing cookies/session for auth
      await chrome.debugger.sendCommand({ tabId }, 'Page.reload', {})

      // Wait for network idle or timeout
      const capturePromise = new Promise<void>((resolve) => {
        resolveCapture = resolve
        resetIdleTimer()
      })
      const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(resolve, CAPTURE_TIMEOUT_MS)
      })

      await Promise.race([capturePromise, timeoutPromise])

      // Give pending body fetches a moment to complete
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } finally {
      chrome.debugger.onEvent.removeListener(eventHandler)
      if (networkIdleTimer) clearTimeout(networkIdleTimer)
    }

    const sizeBytes = completedRecords.reduce((sum, r) => sum + r.responseBody.length, 0)
    return { records: completedRecords, sizeBytes }
  } finally {
    // Already detached
    try {
      await chrome.debugger.detach({ tabId })
    } catch {
      /* */
    }
  }
}

/** Fetch response body eagerly — fire and forget, adds to records if successful */
function fetchBody(options: {
  tabId: number
  requestId: string
  pending: PendingResponse
  records: CdpNetworkRecord[]
}): void {
  const { tabId, requestId, pending, records } = options
  chrome.debugger
    .sendCommand({ tabId }, 'Network.getResponseBody', { requestId })
    .then((result: any) => {
      const bodyResult = result as { body: string; base64Encoded: boolean }
      const bodyBytes = bodyResult.base64Encoded
        ? base64ToUint8Array(bodyResult.body)
        : new TextEncoder().encode(bodyResult.body)

      records.push({
        url: pending.url,
        method: pending.method,
        requestHeaders: {},
        statusCode: pending.statusCode,
        statusText: pending.statusText,
        responseHeaders: pending.responseHeaders,
        responseBody: bodyBytes,
        base64Encoded: false,
        timestamp: pending.timestamp
      })
    })
    .catch(() => {
      // Body not available (redirect, 204, data: URL, etc.) — skip
    })
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

// ── Message handler ──

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'interactive-capture') {
    const { tabId } = message as { tabId: number }
    captureInteractive(tabId)
      .then((result) => {
        const serialized = result.records.map((r) => ({
          ...r,
          responseBody: arrayBufferToBase64(r.responseBody),
          _serialized: true
        }))
        sendResponse({ status: 'captured', records: serialized, sizeBytes: result.sizeBytes })
      })
      .catch((error) => {
        sendResponse({
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : String(error)
        })
      })
    return true
  }
  return false
})

function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = ''
  for (const byte of buffer) binary += String.fromCharCode(byte)
  return btoa(binary)
}
