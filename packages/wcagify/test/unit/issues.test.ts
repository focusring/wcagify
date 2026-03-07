import { describe, it, expect } from 'vitest'
import { filterIssues, sortIssuesBySc, filterTips, groupIssuesBySc } from '../../src/issues'

describe('filterIssues', () => {
  it('removes items with sc=none', () => {
    const issues = [{ sc: '1.1.1' }, { sc: 'none' }, { sc: '2.4.7' }]
    expect(filterIssues(issues)).toEqual([{ sc: '1.1.1' }, { sc: '2.4.7' }])
  })

  it('returns empty array when all are tips', () => {
    expect(filterIssues([{ sc: 'none' }])).toEqual([])
  })

  it('returns all when none are tips', () => {
    const issues = [{ sc: '1.1.1' }, { sc: '2.1.1' }]
    expect(filterIssues(issues)).toEqual(issues)
  })
})

describe('sortIssuesBySc', () => {
  it('sorts numerically by SC', () => {
    const issues = [{ sc: '2.4.7' }, { sc: '1.1.1' }, { sc: '1.2.1' }]
    const sorted = sortIssuesBySc(issues)
    expect(sorted.map((i) => i.sc)).toEqual(['1.1.1', '1.2.1', '2.4.7'])
  })

  it('does not mutate the original array', () => {
    const issues = [{ sc: '2.1.1' }, { sc: '1.1.1' }]
    sortIssuesBySc(issues)
    expect(issues[0]!.sc).toBe('2.1.1')
  })

  it('handles empty array', () => {
    expect(sortIssuesBySc([])).toEqual([])
  })
})

describe('filterTips', () => {
  it('keeps only items with sc=none', () => {
    const issues = [{ sc: '1.1.1' }, { sc: 'none' }, { sc: '2.4.7' }]
    expect(filterTips(issues)).toEqual([{ sc: 'none' }])
  })

  it('returns empty array when no tips exist', () => {
    expect(filterTips([{ sc: '1.1.1' }])).toEqual([])
  })
})

describe('groupIssuesBySc', () => {
  it('groups issues by SC code', () => {
    const issues = [
      { sc: '1.1.1', title: 'a' },
      { sc: '2.4.7', title: 'b' },
      { sc: '1.1.1', title: 'c' }
    ]
    const groups = groupIssuesBySc(issues)
    expect(groups).toHaveLength(2)
    expect(groups[0]!.sc).toBe('1.1.1')
    expect(groups[0]!.issues).toHaveLength(2)
    expect(groups[1]!.sc).toBe('2.4.7')
    expect(groups[1]!.issues).toHaveLength(1)
  })

  it('enriches groups with name and uri', () => {
    const groups = groupIssuesBySc([{ sc: '1.1.1' }], '2.2', 'en')
    expect(groups[0]!.name).toContain('Non-text Content')
    expect(groups[0]!.uri).toContain('quickref')
  })

  it('filters out tips before grouping', () => {
    const issues = [{ sc: 'none' }, { sc: '1.1.1' }]
    const groups = groupIssuesBySc(issues)
    expect(groups).toHaveLength(1)
    expect(groups[0]!.sc).toBe('1.1.1')
  })

  it('returns empty array for no real issues', () => {
    expect(groupIssuesBySc([{ sc: 'none' }])).toEqual([])
  })
})
