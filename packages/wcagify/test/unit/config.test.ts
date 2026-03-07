import { describe, it, expect } from 'vitest'
import { defineWcagifyConfig } from '../../src/config'

describe('defineWcagifyConfig', () => {
  it('prepends the wcagify layer to extends', () => {
    const config = defineWcagifyConfig({})
    expect(config.extends).toEqual(['@focusring/wcagify/layer'])
  })

  it('preserves user extends as string', () => {
    const config = defineWcagifyConfig({ extends: './my-layer' })
    expect(config.extends).toEqual(['@focusring/wcagify/layer', './my-layer'])
  })

  it('preserves user extends as array', () => {
    const config = defineWcagifyConfig({ extends: ['./a', './b'] })
    expect(config.extends).toEqual(['@focusring/wcagify/layer', './a', './b'])
  })

  it('sets default compatibilityDate', () => {
    const config = defineWcagifyConfig({})
    expect(config.compatibilityDate).toBe('2025-01-15')
  })

  it('respects user compatibilityDate', () => {
    const config = defineWcagifyConfig({ compatibilityDate: '2024-06-01' })
    expect(config.compatibilityDate).toBe('2024-06-01')
  })

  it('passes through other user config', () => {
    const config = defineWcagifyConfig({ ssr: false })
    expect(config.ssr).toBe(false)
  })

  it('works with no arguments', () => {
    const config = defineWcagifyConfig()
    expect(config.extends).toEqual(['@focusring/wcagify/layer'])
  })
})
