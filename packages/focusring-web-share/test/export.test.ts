import { describe, it, expect } from 'vitest'
import { useExport } from '../src/composables/useExport'
import type { CapturedPage } from '../src/types'

function makePage(overrides: Partial<CapturedPage> = {}): CapturedPage {
  return {
    id: 'test-1',
    url: 'https://example.com',
    title: 'Example Page',
    addedAt: Date.now(),
    status: 'captured',
    staticCaptured: true,
    staticSizeBytes: 100,
    interactiveCaptured: true,
    interactiveSizeBytes: 200,
    ...overrides
  }
}

describe('useExport', () => {
  const { getTotalSize, formatSize } = useExport()

  describe('formatSize', () => {
    it('formats bytes', () => {
      expect(formatSize(500)).toBe('500 B')
    })

    it('formats kilobytes', () => {
      expect(formatSize(1500)).toBe('1.5 KB')
    })

    it('formats megabytes', () => {
      expect(formatSize(2 * 1024 * 1024)).toBe('2.0 MB')
    })
  })

  describe('getTotalSize', () => {
    it('sums both static and interactive sizes', () => {
      const pages = [
        makePage({ staticSizeBytes: 500, interactiveSizeBytes: 500 }),
        makePage({ id: 'test-2', staticSizeBytes: 1000, interactiveSizeBytes: 1000 })
      ]
      expect(getTotalSize(pages)).toBe('2.9 KB')
    })

    it('handles pages with only static', () => {
      const pages = [
        makePage({
          staticSizeBytes: 1000,
          interactiveCaptured: false,
          interactiveSizeBytes: undefined
        })
      ]
      expect(getTotalSize(pages)).toBe('1000 B')
    })

    it('returns 0 B for no captured pages', () => {
      expect(getTotalSize([])).toBe('0 B')
    })
  })
})
