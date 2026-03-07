import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generatePdf } from '../../../src/pdf/weasyprint-client'

describe('generatePdf', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('sends correct POST request', async () => {
    const mockBuffer = new ArrayBuffer(4)
    vi.mocked(fetch).mockResolvedValue(new Response(mockBuffer, { status: 200 }))

    await generatePdf('<html></html>', 'report.pdf', 'http://weasyprint:5000')

    expect(fetch).toHaveBeenCalledWith(
      'http://weasyprint:5000/generate',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: '<html></html>',
          variant: 'pdf/ua-1',
          filename: 'report.pdf',
          presentational_hints: true
        })
      })
    )
  })

  it('returns Uint8Array on success', async () => {
    const content = new Uint8Array([0x25, 0x50, 0x44, 0x46])
    vi.mocked(fetch).mockResolvedValue(new Response(content, { status: 200 }))

    const result = await generatePdf('<html></html>', 'report.pdf', 'http://weasyprint:5000')
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBe(4)
  })

  it('throws on non-ok response', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response('error', { status: 500, statusText: 'Internal Server Error' })
    )

    await expect(
      generatePdf('<html></html>', 'report.pdf', 'http://weasyprint:5000')
    ).rejects.toThrow('WeasyPrint request failed: 500 Internal Server Error')
  })
})
