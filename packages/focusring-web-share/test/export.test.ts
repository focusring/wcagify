import { describe, it, expect } from 'vitest'
import { unzipSync, strFromU8 } from 'fflate'
import { useExport } from '../src/composables/useExport'
import type { CapturedPage } from '../src/types'

function makePage(overrides: Partial<CapturedPage> = {}): CapturedPage {
  return {
    id: 'test-1',
    url: 'https://example.com',
    title: 'Example Page',
    addedAt: Date.now(),
    status: 'captured',
    sizeBytes: 100,
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
    it('sums captured page sizes', () => {
      const pages = [
        makePage({ sizeBytes: 1000 }),
        makePage({ id: 'test-2', sizeBytes: 2000 }),
        makePage({ id: 'test-3', status: 'pending', sizeBytes: undefined })
      ]
      expect(getTotalSize(pages)).toBe('2.9 KB')
    })

    it('returns 0 B for no captured pages', () => {
      expect(getTotalSize([])).toBe('0 B')
    })
  })
})
