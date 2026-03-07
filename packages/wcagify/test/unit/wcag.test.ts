import { describe, it, expect } from 'vitest'
import { scUri, scName, scorecard, conformanceSummary, PRINCIPLES } from '../../src/wcag'

describe('PRINCIPLES', () => {
  it('contains all four WCAG principles', () => {
    expect(PRINCIPLES).toEqual(['perceivable', 'operable', 'understandable', 'robust'])
  })
})

describe('scUri', () => {
  it('returns a W3C quickref URL for a known SC', () => {
    const uri = scUri('1.1.1', '2.2', 'en')
    expect(uri).toBe('https://www.w3.org/WAI/WCAG22/quickref/#non-text-content')
  })

  it('returns empty string for an unknown SC', () => {
    expect(scUri('99.99.99')).toBe('')
  })

  it('uses default version 2.2 and language en', () => {
    expect(scUri('1.1.1')).toBe('https://www.w3.org/WAI/WCAG22/quickref/#non-text-content')
  })

  it('handles WCAG 2.1', () => {
    const uri = scUri('1.1.1', '2.1', 'en')
    expect(uri).toBe('https://www.w3.org/WAI/WCAG21/quickref/#non-text-content')
  })

  it('handles Dutch language', () => {
    const uri = scUri('1.1.1', '2.2', 'nl')
    expect(uri).toContain('https://www.w3.org/WAI/WCAG22/quickref/#')
  })
})

describe('scName', () => {
  it('returns formatted name for a known SC', () => {
    expect(scName('1.1.1', '2.2', 'en')).toBe('1.1.1: Non-text Content')
  })

  it('returns raw SC string for unknown SC', () => {
    expect(scName('99.99.99')).toBe('99.99.99')
  })

  it('uses default version and language', () => {
    expect(scName('2.4.7')).toContain('2.4.7:')
  })
})

describe('scorecard', () => {
  it('returns full conformance with no issues', () => {
    const result = scorecard([], 'AA', '2.2')
    expect(result.conforming.all).toBe(result.totals.all)
    expect(result.totals.all).toBeGreaterThan(0)
  })

  it('decreases conforming count for each failing SC', () => {
    const full = scorecard([], 'AA', '2.2')
    const withIssues = scorecard([{ sc: '1.1.1' }, { sc: '2.4.7' }], 'AA', '2.2')
    expect(withIssues.conforming.all).toBe(full.totals.all - 2)
  })

  it('deduplicates issues with the same SC', () => {
    const result = scorecard([{ sc: '1.1.1' }, { sc: '1.1.1' }], 'AA', '2.2')
    const full = scorecard([], 'AA', '2.2')
    expect(result.conforming.all).toBe(full.totals.all - 1)
  })

  it('counts per principle correctly', () => {
    const result = scorecard([{ sc: '1.1.1' }], 'AA', '2.2')
    const full = scorecard([], 'AA', '2.2')
    expect(result.conforming.perceivable).toBe(full.totals.perceivable - 1)
    expect(result.conforming.operable).toBe(full.totals.operable)
    expect(result.conforming.understandable).toBe(full.totals.understandable)
    expect(result.conforming.robust).toBe(full.totals.robust)
  })

  it('handles level A', () => {
    const result = scorecard([], 'A', '2.2')
    expect(result.totals.all).toBeGreaterThan(0)
    expect(result.totals.all).toBeLessThan(scorecard([], 'AA', '2.2').totals.all)
  })

  it('ignores issues for SCs outside target level', () => {
    const aaaSc = '1.2.6'
    const result = scorecard([{ sc: aaaSc }], 'AA', '2.2')
    const full = scorecard([], 'AA', '2.2')
    expect(result.conforming.all).toBe(full.totals.all)
  })
})

describe('conformanceSummary', () => {
  it('reports fully conforming with no issues', () => {
    const result = conformanceSummary([], 'AA', '2.2')
    expect(result.isFullyConforming).toBe(true)
  })

  it('reports not fully conforming with issues', () => {
    const result = conformanceSummary([{ sc: '1.1.1' }], 'AA', '2.2')
    expect(result.isFullyConforming).toBe(false)
  })

  it('includes scorecard data', () => {
    const result = conformanceSummary([], 'AA', '2.2')
    expect(result).toHaveProperty('conforming')
    expect(result).toHaveProperty('totals')
  })
})
