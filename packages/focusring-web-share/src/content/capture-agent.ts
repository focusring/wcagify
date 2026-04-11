export {}

let singleFileLoaded = false

async function ensureSingleFile() {
  if (singleFileLoaded) return
  // single-file-core registers itself on globalThis when imported
  await import('single-file-core/single-file')
  singleFileLoaded = true
}

async function captureCurrentPage(): Promise<{ html: string; sizeBytes: number }> {
  await ensureSingleFile()

  const singleFile = (globalThis as any).singleFile

  if (!singleFile) {
    throw new Error('SingleFile core not available')
  }

  const options = singleFile.helper.getOptions({
    removeHiddenElements: false,
    removeUnusedStyles: false,
    removeUnusedFonts: false,
    removeFrames: false,
    compressHTML: false,
    loadDeferredImages: true,
    loadDeferredImagesMaxIdleTime: 3000,
    filenameTemplate: '{page-title}',
    includeInfobar: false,
    removeScripts: false,
    blockScripts: false,
    saveOriginalURLs: true,
    insertMetaCSP: false
  })

  const pageData = await singleFile.getPageData(options)
  const html = pageData.content as string
  const sizeBytes = new Blob([html]).size

  return { html, sizeBytes }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'start-capture') {
    captureCurrentPage()
      .then(({ html, sizeBytes }) => {
        // Store captured HTML in session storage via background,
        // since message passing has size limits
        chrome.runtime.sendMessage({
          type: 'capture-complete',
          pageId: message.pageId,
          html,
          sizeBytes
        })
      })
      .catch((error) => {
        chrome.runtime.sendMessage({
          type: 'capture-failed',
          pageId: message.pageId,
          errorMessage: error instanceof Error ? error.message : String(error)
        })
      })
    sendResponse({ ack: true })
  }
  return false
})
