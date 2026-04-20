import type { CdpNetworkRecord } from '../types'

/**
 * Interactive capture via the background service worker.
 *
 * The side panel cannot use chrome.debugger directly — it's only available
 * in the service worker context. So we send a message to the service worker
 * which runs the CDP capture, then returns the serialized records.
 */
function useCaptureInteractive() {
  async function captureInteractive(
    tabId: number
  ): Promise<{ records: CdpNetworkRecord[]; sizeBytes: number }> {
    const response = (await chrome.runtime.sendMessage({
      type: 'interactive-capture',
      tabId
    })) as {
      status: string
      records?: (CdpNetworkRecord & { _serialized?: boolean; responseBody: string })[]
      sizeBytes?: number
      errorMessage?: string
    }

    if (response.status !== 'captured' || !response.records) {
      throw new Error(response.errorMessage ?? 'Interactive capture failed')
    }

    // Deserialize records — responseBody was sent as base64 from the service worker
    const records: CdpNetworkRecord[] = response.records.map((r) => ({
      ...r,
      responseBody: base64ToUint8Array(r.responseBody)
    }))

    return {
      records,
      sizeBytes: response.sizeBytes ?? 0
    }
  }

  return { captureInteractive }
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export { useCaptureInteractive }
