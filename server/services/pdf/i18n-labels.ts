import nl from '../../../i18n/locales/nl.json'
import en from '../../../i18n/locales/en.json'
import type { Language } from './types'

const locales: Record<string, Record<string, unknown>> = { nl, en }

export function t(key: string, language: Language, params?: Record<string, string | number>): string {
  const keys = key.split('.')
  let value: unknown = locales[language]
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k]
  }
  if (typeof value !== 'string') return key
  if (!params) return value
  return value.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? ''))
}
