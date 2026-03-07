import Database from 'better-sqlite3'
import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto'
import { nanoid } from 'nanoid'
import { dirname, join } from 'node:path'
import { mkdirSync } from 'node:fs'

export interface ShareRow {
  token: string
  report_slug: string
  created_at: string
  expires_at: string | null
  password_hash: string | null
  delete_token: string
}

export interface Share {
  token: string
  report_slug: string
  created_at: string
  expires_at: string | null
  password_hash: boolean
  delete_token: string
}

export function toPublicShare(row: ShareRow): Share {
  return {
    token: row.token,
    report_slug: row.report_slug,
    created_at: row.created_at,
    expires_at: row.expires_at,
    password_hash: !!row.password_hash,
    delete_token: row.delete_token
  }
}

interface Migration {
  version: number
  up: (db: Database.Database) => void
}

const migrations: Migration[] = [
  {
    version: 1,
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS shares (
          token TEXT PRIMARY KEY,
          report_slug TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          expires_at TEXT,
          password_hash TEXT,
          delete_token TEXT NOT NULL
        )
      `)
      db.exec(`CREATE INDEX IF NOT EXISTS idx_shares_report_slug ON shares(report_slug)`)
    }
  }
]

function runMigrations(db: Database.Database): void {
  const currentVersion = (db.pragma('user_version', { simple: true }) as number) ?? 0

  const pending = migrations
    .filter((m) => m.version > currentVersion)
    .sort((a, b) => a.version - b.version)

  for (const migration of pending) {
    db.transaction(() => {
      migration.up(db)
      db.pragma(`user_version = ${migration.version}`)
    })()
  }
}

let db: Database.Database | null = null

function getSharesDb(): Database.Database {
  if (db) return db

  const dbPath = join(process.cwd(), '.data', 'shares.sqlite')
  mkdirSync(dirname(dbPath), { recursive: true })
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  runMigrations(db)

  return db
}

const PBKDF2_ITERATIONS = 100_000
const KEY_LENGTH = 32
const SALT_LENGTH = 16

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH)
  const dk = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha512')
  return `${salt.toString('hex')}:${dk.toString('hex')}`
}

function verifyPassword(stored: string, password: string): boolean {
  const [saltHex, dkHex] = stored.split(':')
  if (!saltHex || !dkHex) return false
  const salt = Buffer.from(saltHex, 'hex')
  const storedDk = Buffer.from(dkHex, 'hex')
  const dk = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha512')
  return timingSafeEqual(storedDk, dk)
}

export function normalizeExpiresAt(expiresAt?: string): string | null {
  if (!expiresAt) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(expiresAt)) {
    return `${expiresAt}T23:59:59.999Z`
  }
  return expiresAt
}

export function createShare(reportSlug: string, expiresAt?: string, password?: string): Share {
  const db = getSharesDb()
  const token = nanoid(12)
  const deleteToken = nanoid(24)
  const passwordHash = password ? hashPassword(password) : null
  const normalizedExpiry = normalizeExpiresAt(expiresAt)

  db.prepare(
    'INSERT INTO shares (token, report_slug, expires_at, password_hash, delete_token) VALUES (?, ?, ?, ?, ?)'
  ).run(token, reportSlug, normalizedExpiry, passwordHash, deleteToken)

  const row = db.prepare('SELECT * FROM shares WHERE token = ?').get(token) as ShareRow
  return toPublicShare(row)
}

export function getShareByToken(token: string): ShareRow | undefined {
  const db = getSharesDb()
  const share = db.prepare('SELECT * FROM shares WHERE token = ?').get(token) as
    | ShareRow
    | undefined

  if (share?.expires_at && new Date(share.expires_at) < new Date()) {
    return undefined
  }

  return share
}

export function verifySharePassword(share: ShareRow, password: string): boolean {
  if (!share.password_hash) return true
  return verifyPassword(share.password_hash, password)
}

export function listSharesByReport(reportSlug: string): Share[] {
  const db = getSharesDb()
  const rows = db
    .prepare('SELECT * FROM shares WHERE report_slug = ? ORDER BY created_at DESC')
    .all(reportSlug) as ShareRow[]
  return rows.map(toPublicShare)
}

export function deleteShare(token: string, deleteToken: string): boolean {
  const db = getSharesDb()
  const result = db
    .prepare('DELETE FROM shares WHERE token = ? AND delete_token = ?')
    .run(token, deleteToken)
  return result.changes > 0
}

export function resetSharesDb(): void {
  if (db) {
    db.close()
    db = null
  }
}

export function getAdminSecret(): string | null {
  return process.env.WCAGIFY_ADMIN_SECRET || null
}

export function isAdminConfigured(): boolean {
  return !!process.env.WCAGIFY_ADMIN_SECRET
}
