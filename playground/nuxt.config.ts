import { dirname } from 'node:path'
import { createRequire } from 'node:module'
import { defineNuxtModule } from '@nuxt/kit'

const wcagifyI18n = defineNuxtModule({
  setup(_options, nuxt) {
    const require = createRequire(import.meta.url)
    const localesDir = dirname(require.resolve('wcagify/locales/en'))

    nuxt.hook('i18n:registerModule', (register) => {
      register({
        langDir: localesDir,
        locales: [
          { code: 'nl', file: 'nl.json' },
          { code: 'en', file: 'en.json' }
        ]
      })
    })
  }
})

export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxt/content', 'nuxt-studio', '@nuxtjs/i18n', '@nuxt/icon', wcagifyI18n],

  runtimeConfig: {
    weasyprintUrl: 'https://magnificent-encouragement-production.up.railway.app'
  },

  content: {
    experimental: {
      sqliteConnector: 'native'
    }
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  nitro: {
    vercel: {
      functions: {
        maxDuration: 60
      }
    }
  },

  compatibilityDate: '2025-01-15',

  icon: {
    customCollections: [
      {
        prefix: 'logo',
        dir: './app/assets/logo'
      }
    ]
  },

  i18n: {
    defaultLocale: 'nl',
    strategy: 'prefix_except_default',
    locales: [
      {
        code: 'nl',
        name: 'Nederlands',
        language: 'nl-NL',
        file: 'nl.json'
      },
      {
        code: 'en',
        name: 'English',
        language: 'en-US',
        file: 'en.json'
      }
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  }
})
