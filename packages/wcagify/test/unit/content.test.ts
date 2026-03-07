import { describe, it, expect, vi } from 'vitest'

vi.mock('@nuxt/content', () => ({
  defineCollection: (config: unknown) => config
}))

import { defineWcagifyCollections } from '../../src/content'

describe('defineWcagifyCollections', () => {
  it('returns reports and issues collections', () => {
    const collections = defineWcagifyCollections()
    expect(collections).toHaveProperty('reports')
    expect(collections).toHaveProperty('issues')
  })

  it('reports collection sources index.md files', () => {
    const { reports } = defineWcagifyCollections()
    expect(reports.source.include).toBe('reports/**/index.md')
  })

  it('issues collection excludes index.md files', () => {
    const { issues } = defineWcagifyCollections()
    expect(issues.source.include).toBe('reports/**/*.md')
    expect(issues.source.exclude).toContain('reports/**/index.md')
  })

  it('reports collection has page type', () => {
    const { reports } = defineWcagifyCollections()
    expect(reports.type).toBe('page')
  })

  it('issues collection has page type', () => {
    const { issues } = defineWcagifyCollections()
    expect(issues.type).toBe('page')
  })
})
