import { defineNitroPlugin } from 'nitropack/runtime'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html) => {
    // Deduplicate CSS <link> tags — Nuxt's Vite dev renderer can produce
    // duplicate stylesheet links with different URL prefixes (@fs/ vs bare path)
    const seen = new Set<string>()
    html.head = html.head.map((chunk: string) =>
      chunk.replace(
        /<link[^>]*rel="stylesheet"[^>]*href="([^"]*)"[^>]*>/g,
        (match: string, href: string) => {
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

    // Prevent FOUC: hide the page until all render-blocking CSS is loaded.
    // In Vite dev mode, external CSS (Tailwind utilities) is processed on-demand
    // while inline styles (Nuxt UI theme) load instantly, causing a brief flash
    // of partially-styled content.
    html.head.unshift('<style>html:not(.css-ready){visibility:hidden}</style>')
    html.bodyAppend.push(`<script>document.documentElement.classList.add('css-ready')</script>`)
  })
})
