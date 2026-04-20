import { WARCRecord, WARCSerializer } from 'warcio'
import type { CdpNetworkRecord } from '../types'

/**
 * Build a WARC file from captured CDP records using warcio.
 * warcio is from the same team as replayweb.page, guaranteeing format compatibility.
 */
export async function buildWarc(
  records: CdpNetworkRecord[],
  pageUrl: string,
  pageTitle: string
): Promise<{ warcBytes: Uint8Array }> {
  const chunks: Uint8Array[] = []

  // 1. warcinfo record
  const warcinfoRecord = WARCRecord.createWARCInfo(
    { filename: 'data.warc', warcVersion: 'WARC/1.1' },
    {
      software: 'FocusRing Web Share',
      format: 'WARC File Format 1.1',
      title: pageTitle,
      description: `Interactive capture of ${pageUrl}`
    }
  )
  const gzipOpts = { gzip: true }
  const warcinfoBytes = await WARCSerializer.serialize(warcinfoRecord, gzipOpts)
  chunks.push(warcinfoBytes)

  // 2. Response records (each individually gzipped for .warc.gz format)
  for (const record of records) {
    try {
      const date = new Date(record.timestamp * 1000).toISOString()

      const statusline = `HTTP/1.1 ${record.statusCode} ${record.statusText || 'OK'}`

      const warcRecord = WARCRecord.create(
        {
          url: record.url,
          date,
          type: 'response',
          warcVersion: 'WARC/1.1',
          httpHeaders: record.responseHeaders,
          statusline
        },
        [record.responseBody]
      )

      const recordBytes = await WARCSerializer.serialize(warcRecord, gzipOpts)
      chunks.push(recordBytes)
    } catch {
      // Skip records that fail to serialize
    }
  }

  // Concatenate
  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0)
  const warcBytes = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    warcBytes.set(chunk, offset)
    offset += chunk.length
  }

  return { warcBytes }
}
