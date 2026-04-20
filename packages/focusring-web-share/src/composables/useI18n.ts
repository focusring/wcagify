import { ref, computed, watch } from 'vue'
import type { Locale, Messages } from '../i18n'
import { messages } from '../i18n'

const locale = ref<Locale>('en')

let localeLoaded = false
let loadPromise: Promise<void> | undefined = undefined

async function doLoad() {
  const result = await chrome.storage.local.get(['locale'])
  if (result.locale && (result.locale as string) in messages) locale.value = result.locale as Locale
  localeLoaded = true
}

function load() {
  if (!loadPromise) loadPromise = doLoad()
  return loadPromise
}

watch(locale, (val) => {
  if (localeLoaded) chrome.storage.local.set({ locale: val })
})

type NestedKeyOf<T, Prefix extends string = ''> =
  T extends Record<string, unknown>
    ? {
        [K in keyof T & string]: T[K] extends Record<string, unknown>
          ? NestedKeyOf<T[K], `${Prefix}${K}.`>
          : `${Prefix}${K}`
      }[keyof T & string]
    : never

type TranslationKey = NestedKeyOf<Messages>

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current == undefined || typeof current !== 'object') return path
    current = (current as Record<string, unknown>)[key]
  }
  return typeof current === 'string' ? current : path
}

export function useI18n() {
  const loadReady = load()

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let value = getNestedValue(messages[locale.value] as unknown as Record<string, unknown>, key)
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(`{${k}}`, String(v))
      }
    }
    return value
  }

  const currentMessages = computed(() => messages[locale.value])

  return { locale, t, messages: currentMessages, ready: loadReady }
}
