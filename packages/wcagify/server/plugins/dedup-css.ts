import { defineNitroPlugin } from 'nitropack/runtime'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html) => {
    const seen = new Set<string>()
    html.head = html.head.map((chunk: string) =>
      chunk.replace(
        /<link[^>]*rel="stylesheet"[^>]*href="([^"]*)"[^>]*>/g,
        (match: string, href: string) => {
          // Normalize: strip Vite URL prefixes to get the canonical file path
          const normalized = href
            .replace(/^\/_nuxt\//, '')
            .replace(/^@fs\//, '')
            .replace(/^virtual:nuxt:[^"]*$/, (v: string) => v)
          if (seen.has(normalized)) {
            return ''
          }
          seen.add(normalized)
          return match
        }
      )
    )
  })
})
