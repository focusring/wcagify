import type { init, getPageData, helper } from 'single-file-core/single-file'

interface SingleFileModule {
  init: typeof init
  getPageData: typeof getPageData
  helper: typeof helper
}

// Store last captured HTML so the side panel can retrieve it via chrome.scripting
;(globalThis as any).__focusringCapturedHtml = undefined

let singleFile: SingleFileModule | undefined = undefined

async function ensureSingleFile() {
  if (singleFile) return
  singleFile = await import('single-file-core/single-file')
}

const CAPTURE_TIMEOUT_MS = 30_000

async function captureCurrentPage(): Promise<number> {
  await ensureSingleFile()

  const options = {
    removeHiddenElements: false,
    removeUnusedStyles: false,
    removeUnusedFonts: false,
    removeFrames: true,
    compressHTML: false,
    loadDeferredImages: false,
    loadDeferredImagesMaxIdleTime: 0,
    filenameTemplate: '{page-title}',
    includeInfobar: false,
    removeScripts: false,
    blockScripts: false,
    saveOriginalURLs: true,
    insertMetaCSP: false,
    blockVideos: true,
    blockAudios: true
  }

  const capturePromise = singleFile!.getPageData(options)
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Capture timed out after 30 seconds')), CAPTURE_TIMEOUT_MS)
  )

  const pageData = await Promise.race([capturePromise, timeoutPromise])
  const html = pageData.content as string
  const sizeBytes = new Blob([html]).size

  // Store HTML for retrieval by the side panel
  ;(globalThis as any).__focusringCapturedHtml = html

  return sizeBytes
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'ping') {
    sendResponse({ pong: true })
    return false
  }
  if (message.type === 'start-capture') {
    // Return true to keep the message channel open for async sendResponse
    captureCurrentPage()
      .then((sizeBytes) => {
        sendResponse({ status: 'captured', sizeBytes })
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
