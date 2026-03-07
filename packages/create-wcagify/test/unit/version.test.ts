import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CLI_VERSION, fetchLatestWcagifyVersion } from '../../src/version'

describe('CLI_VERSION', () => {
  it('is a non-empty string', () => {
    expect(typeof CLI_VERSION).toBe('string')
    expect(CLI_VERSION.length).toBeGreaterThan(0)
  })

  it('looks like a semver version', () => {
    expect(CLI_VERSION).toMatch(/^\d+\.\d+\.\d+/)
  })
})

describe('fetchLatestWcagifyVersion', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('returns latest version on success', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ 'dist-tags': { latest: '1.2.3' } }))
    )
    const version = await fetchLatestWcagifyVersion()
    expect(version).toBe('1.2.3')
  })

  it('returns fallback on non-ok response', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('', { status: 404 }))
    const version = await fetchLatestWcagifyVersion()
    expect(version).toBe('0.1.0')
  })

  it('returns fallback on network error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network error'))
    const version = await fetchLatestWcagifyVersion()
    expect(version).toBe('0.1.0')
  })
})
