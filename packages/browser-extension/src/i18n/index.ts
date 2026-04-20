import en from './en'
import nl from './nl'

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown> ? DeepStringify<T[K]> : string
}

type Messages = DeepStringify<typeof en>
type Locale = 'en' | 'nl'

const messages: Record<Locale, Messages> = { en, nl }

const localeLabels: Record<Locale, string> = {
  en: 'English',
  nl: 'Nederlands'
}

export { type Messages, type Locale, messages, localeLabels }
