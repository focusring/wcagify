import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { existsSync, mkdirSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import {
  createShare,
  getShareByToken,
  verifySharePassword,
  listSharesByReport,
  deleteShare,
  hashPassword,
  resetSharesDb
} from '../../server/utils/shares'

const DB_DIR = join(process.cwd(), '.data')
const DB_PATH = join(DB_DIR, 'shares.sqlite')

function cleanDb() {
  resetSharesDb()
  for (const f of [DB_PATH, `${DB_PATH}-wal`, `${DB_PATH}-shm`]) {
    if (existsSync(f)) unlinkSync(f)
  }
}

describe('shares', () => {
  beforeEach(() => {
    if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true })
    cleanDb()
  })

  afterAll(() => {
    cleanDb()
  })

  describe('createShare', () => {
    it('creates a share with a 12-character token', () => {
      const share = createShare('example')

      expect(share.token).toHaveLength(12)
      expect(share.report_slug).toBe('example')
      expect(share.created_at).toBeTruthy()
      expect(share.expires_at).toBeNull()
      expect(share.password_hash).toBeNull()
    })

    it('creates a share with expiry date', () => {
      const share = createShare('example', '2030-12-31')
      expect(share.expires_at).toBe('2030-12-31')
    })

    it('creates a share with password hash', () => {
      const share = createShare('example', undefined, 'secret123')

      expect(share.password_hash).toBeTruthy()
      expect(share.password_hash).not.toBe('secret123')
    })

    it('generates unique tokens', () => {
      const a = createShare('example')
      const b = createShare('example')

      expect(a.token).not.toBe(b.token)
    })
  })

  describe('getShareByToken', () => {
    it('returns a share by its token', () => {
      const created = createShare('example')

      const found = getShareByToken(created.token)
      expect(found).toBeDefined()
      expect(found!.report_slug).toBe('example')
    })

    it('returns undefined for unknown token', () => {
      expect(getShareByToken('nonexistent')).toBeUndefined()
    })

    it('returns undefined for expired share', () => {
      const share = createShare('example', '2020-01-01')
      expect(getShareByToken(share.token)).toBeUndefined()
    })

    it('returns share with future expiry', () => {
      const share = createShare('example', '2099-12-31')
      expect(getShareByToken(share.token)).toBeDefined()
    })
  })

  describe('verifySharePassword', () => {
    it('returns true when share has no password', () => {
      const share = createShare('example')
      expect(verifySharePassword(share, 'anything')).toBe(true)
    })

    it('returns true for correct password', () => {
      const share = createShare('example', undefined, 'secret123')
      expect(verifySharePassword(share, 'secret123')).toBe(true)
    })

    it('returns false for incorrect password', () => {
      const share = createShare('example', undefined, 'secret123')
      expect(verifySharePassword(share, 'wrong')).toBe(false)
    })
  })

  describe('listSharesByReport', () => {
    it('returns all shares for a report slug', () => {
      createShare('report-a')
      createShare('report-a')
      createShare('report-b')

      const shares = listSharesByReport('report-a')
      expect(shares).toHaveLength(2)
      expect(shares.every((s) => s.report_slug === 'report-a')).toBe(true)
    })

    it('returns empty array when no shares exist', () => {
      expect(listSharesByReport('nonexistent')).toEqual([])
    })
  })

  describe('deleteShare', () => {
    it('deletes an existing share', () => {
      const share = createShare('example')

      expect(deleteShare(share.token)).toBe(true)
      expect(getShareByToken(share.token)).toBeUndefined()
    })

    it('returns false for nonexistent token', () => {
      expect(deleteShare('nonexistent')).toBe(false)
    })
  })

  describe('hashPassword', () => {
    it('produces consistent hashes', () => {
      expect(hashPassword('test')).toBe(hashPassword('test'))
    })

    it('produces different hashes for different passwords', () => {
      expect(hashPassword('a')).not.toBe(hashPassword('b'))
    })
  })
})
