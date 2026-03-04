import { defineWcagifyConfig } from '@focusring/wcagify'

export default defineNuxtConfig(
  defineWcagifyConfig({
    devtools: { enabled: true },

    nitro: {
      vercel: {
        functions: {
          maxDuration: 60
        }
      }
    }
  })
)
