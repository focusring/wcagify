import { gzipSync, zipSync, strToU8 } from 'fflate'
import { CDXIndexer } from 'warcio'
import type { CdpNetworkRecord } from '../types'
import { buildWarc } from './warc-builder'

/**
 * Build a WACZ file from captured CDP records.
 * Uses warcio for WARC creation and CDX indexing (same team as replayweb.page).
 */
async function buildWacz(options: {
  records: CdpNetworkRecord[]
  pageUrl: string
  pageTitle: string
  captureDate: string
}): Promise<Uint8Array> {
  const { records, pageUrl, pageTitle, captureDate } = options

  // 1. Build gzipped WARC using warcio (each record is individually gzipped)
  const { warcBytes } = await buildWarc(records, pageUrl, pageTitle)

  // 2. Generate CDX index from the .warc.gz using warcio's CDXIndexer
  const cdxLines: string[] = []
  const cdxIndexer = new CDXIndexer({ format: 'cdxj' })
  const warcStream = createReadableFromBytes(warcBytes)
  for await (const cdxEntry of cdxIndexer.iterIndex([
    { filename: 'data.warc.gz', reader: warcStream }
  ])) {
    cdxLines.push(cdxIndexer.serialize(cdxEntry))
  }
  const cdxContent = cdxLines.join('')
  // CDX must be gzip compressed per WACZ spec
  const cdxGz = gzipSync(strToU8(cdxContent))

  // 3. Build pages.jsonl
  const pagesJsonl = `${JSON.stringify({
    format: 'json-pages-1.0',
    id: 'pages',
    title: pageTitle,
    hasText: false
  })}\n${JSON.stringify({
    id: crypto.randomUUID(),
    url: pageUrl,
    title: pageTitle,
    ts: captureDate
  })}\n`

  // 4. Compute SHA-256 hashes
  const warcHash = await sha256Hash(warcBytes)
  const cdxHash = await sha256Hash(cdxGz)
  const pagesHash = await sha256Hash(strToU8(pagesJsonl))

  // 5. Build datapackage.json
  const datapackage = JSON.stringify(
    {
      profile: 'data-package',
      wpiVersion: '1.0.0',
      software: 'FocusRing Web Share',
      created: captureDate,
      title: pageTitle,
      mainPageUrl: pageUrl,
      resources: [
        {
          name: 'data.warc.gz',
          path: 'archive/data.warc.gz',
          hash: warcHash,
          bytes: warcBytes.length
        },
        {
          name: 'index.cdx.gz',
          path: 'indexes/index.cdx.gz',
          hash: cdxHash,
          bytes: cdxGz.length
        },
        {
          name: 'pages.jsonl',
          path: 'pages/pages.jsonl',
          hash: pagesHash,
          bytes: strToU8(pagesJsonl).length
        }
      ]
    },
    undefined,
    2
  )

  // 6. Build datapackage-digest.json
  const datapackageHash = await sha256Hash(strToU8(datapackage))
  const datapackageDigest = JSON.stringify({
    path: 'datapackage.json',
    hash: datapackageHash
  })

  // 7. Assemble WACZ ZIP (level: 0 — WARC and CDX are already gzip compressed)
  const files: Record<string, Uint8Array> = {
    'datapackage.json': strToU8(datapackage),
    'datapackage-digest.json': strToU8(datapackageDigest),
    'archive/data.warc.gz': warcBytes,
    'indexes/index.cdx.gz': cdxGz,
    'pages/pages.jsonl': strToU8(pagesJsonl)
  }

  return zipSync(files, { level: 0 })
}

async function sha256Hash(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data.buffer as ArrayBuffer)
  const hashArray = [...new Uint8Array(hashBuffer)]
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return `sha256:${hashHex}`
}

function createReadableFromBytes(data: Uint8Array) {
  return {
    async *[Symbol.asyncIterator]() {
      yield data
    }
  }
}

/**
 * Generate the replayweb.page viewer HTML for a WACZ file.
 */
function generateViewerHtml(waczFilename: string, pageTitle: string, _pageUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interactive Capture - ${escapeHtml(pageTitle)}</title>
  <script src="../replay/ui.js"></${'script'}>
  <style>
    html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }
  </style>
</head>
<body>
  <replay-web-page
    source="./${escapeHtml(waczFilename)}"
    replayBase="../replay/"
    deepLink="true"
    embed="default"
    style="width:100%;height:100vh;display:block;"
  ></replay-web-page>
</body>
</html>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export { buildWacz, generateViewerHtml }
