import { prepareForPdf } from './html-processor'
import { generatePdf } from './weasyprint-client'

type LocalFetch = (url: string, init?: RequestInit) => Promise<Response>

interface ReportPdfOptions {
  slug: string
  filename: string
  weasyprintUrl: string
  baseUrl: string
  localFetch: LocalFetch
}

export async function generateReportPdf(options: ReportPdfOptions): Promise<Uint8Array> {
  const pageResponse = await options.localFetch(`/reports/${options.slug}`)
  const ssrHtml = await pageResponse.text()
  const html = await prepareForPdf(ssrHtml, options.baseUrl)

  return generatePdf(html, options.filename, options.weasyprintUrl)
}
