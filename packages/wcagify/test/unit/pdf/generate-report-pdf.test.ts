import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../src/pdf/html-processor', () => ({
  prepareForPdf: vi.fn()
}))

vi.mock('../../../src/pdf/weasyprint-client', () => ({
  generatePdf: vi.fn()
}))

import { generateReportPdf } from '../../../src/pdf/generate-report-pdf'
import { prepareForPdf } from '../../../src/pdf/html-processor'
import { generatePdf } from '../../../src/pdf/weasyprint-client'

describe('generateReportPdf', () => {
  const baseOptions = {
    slug: 'my-report',
    filename: 'report.pdf',
    weasyprintUrl: 'http://weasyprint:5000',
    baseUrl: 'http://localhost:3000',
    localFetch: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches report HTML, processes it, and generates PDF', async () => {
    baseOptions.localFetch.mockResolvedValue(new Response('<html>raw</html>'))
    vi.mocked(prepareForPdf).mockResolvedValue('<html>processed</html>')
    vi.mocked(generatePdf).mockResolvedValue(new Uint8Array([1, 2, 3]))

    const result = await generateReportPdf(baseOptions)

    expect(baseOptions.localFetch).toHaveBeenCalledWith('/reports/my-report')
    expect(prepareForPdf).toHaveBeenCalledWith('<html>raw</html>', 'http://localhost:3000')
    expect(generatePdf).toHaveBeenCalledWith(
      '<html>processed</html>',
      'report.pdf',
      'http://weasyprint:5000'
    )
    expect(result).toBeInstanceOf(Uint8Array)
  })
})
