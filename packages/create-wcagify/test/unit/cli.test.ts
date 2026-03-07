import { describe, it, expect, vi } from 'vitest'

vi.mock('../../src/create.js', () => ({
  create: vi.fn(() => Promise.resolve())
}))

vi.mock('../../src/version.js', () => ({
  CLI_VERSION: '0.2.0'
}))

import { run } from '../../src/cli'

describe('run', () => {
  it('is a function', () => {
    expect(typeof run).toBe('function')
  })

  it('parses empty args without throwing', async () => {
    process.argv = ['node', 'cli.js']
    await expect(run()).resolves.toBeUndefined()
  })
})
