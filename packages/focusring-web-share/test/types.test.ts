import { describe, it, expect } from 'vitest'
import { capturedPageSchema, captureStatusSchema } from '../src/types'

describe('captureStatusSchema', () => {
  it('accepts valid statuses', () => {
    expect(captureStatusSchema.parse('pending')).toBe('pending')
    expect(captureStatusSchema.parse('capturing')).toBe('capturing')
    expect(captureStatusSchema.parse('captured')).toBe('captured')
    expect(captureStatusSchema.parse('failed')).toBe('failed')
  })

  it('rejects invalid statuses', () => {
    expect(() => captureStatusSchema.parse('unknown')).toThrow()
  })
})

describe('capturedPageSchema', () => {
  it('validates a complete page', () => {
    const page = {
      id: 'abc123',
      url: 'https://example.com/page',
      title: 'Example Page',
      faviconUrl: 'https://example.com/favicon.ico',
      addedAt: Date.now(),
      status: 'pending' as const
    }
    expect(capturedPageSchema.parse(page)).toEqual(page)
  })

  it('validates a page with optional fields', () => {
    const page = {
      id: 'abc123',
      url: 'https://example.com/page',
      title: 'Example Page',
      addedAt: Date.now(),
      status: 'captured' as const,
      sizeBytes: 12345
    }
    expect(capturedPageSchema.parse(page)).toEqual(page)
  })

  it('rejects invalid url', () => {
    const page = {
      id: 'abc123',
      url: 'not-a-url',
      title: 'Example Page',
      addedAt: Date.now(),
      status: 'pending' as const
    }
    expect(() => capturedPageSchema.parse(page)).toThrow()
  })
})
