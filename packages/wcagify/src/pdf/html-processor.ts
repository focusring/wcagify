const STYLESHEET_RE = /<link\s+[^>]*rel=["']stylesheet["'][^>]*>/gi
const HREF_RE = /href=["']([^"']+)["']/i
const SCRIPT_RE = /<script\b[^>]*>[\s\S]*?<\/script>/gi
const PRELOAD_RE = /<link\s+[^>]*rel=["'](?:modulepreload|preload)["'][^>]*>/gi
const PRINT_HIDDEN_RE = /<div[^>]*class="[^"]*print:hidden[^"]*"[^>]*>[\s\S]*?<\/div>/gi
const APP_SEPARATOR_RE = /<\/main>\s*<div[^>]*role="separator"[^>]*>[\s\S]*?<\/div>/gi
const TABLE_SEPARATOR_TR_RE = /<tr\s+data-slot="separator"[^>]*>[\s\S]*?<\/tr>/gi

function stripCssLayers(css: string): string {
  let result = ''
  let i = 0

  while (i < css.length) {
    if (css.startsWith('@layer', i)) {
      let j = i + 6
      while (j < css.length && css[j] !== '{' && css[j] !== ';') j++

      if (css[j] === ';') {
        i = j + 1
        continue
      }

      i = j + 1
      let depth = 1
      const contentStart = i
      while (i < css.length && depth > 0) {
        if (css[i] === '{') depth++
        else if (css[i] === '}') depth--
        if (depth > 0) i++
      }
      result += css.slice(contentStart, i)
      i++
    } else {
      result += css[i]
      i++
    }
  }

  return result
}

function forceLightMode(html: string): string {
  let result = html

  result = result.replace(
    /<html([^>]*)class="([^"]*)"/,
    (_match, before: string, classes: string) => {
      const cleaned = classes.replace(/\bdark\b/g, '').trim()
      return `<html${before}class="${cleaned}"`
    }
  )

  result = result.replace(
    /<html([^>]*)style="([^"]*)"/,
    (_match, before: string, style: string) => {
      const cleaned = style.replace(/color-scheme:\s*dark\s*;?/g, '').trim()
      return `<html${before}style="color-scheme: light; ${cleaned}"`
    }
  )

  return result
}

const PDF_OVERRIDES = `<style>
  :root { color-scheme: light !important; }
  [data-color-mode="dark"] { color-scheme: light !important; }

  .sr-only {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border-width: 0 !important;
  }

  [class*="overflow-hidden"], [class*="overflow-auto"] {
    overflow: visible !important;
  }
  .overflow-clip, [class*="overflow-clip"] {
    overflow: visible !important;
  }

  article > dl {
    display: block !important;
    font-size: 9.5pt !important;
    line-height: 1.6 !important;
  }
  article > dl > div {
    display: inline !important;
  }
  article > dl > div + div::before {
    content: " ·  " !important;
    color: #9ca3af !important;
  }
  article > dl > div > dt,
  article > dl > div > dd {
    display: inline !important;
  }
  article > dl > div > dt {
    font-weight: 600 !important;
  }

  .prose h2 {
    font-size: 13pt !important;
    font-weight: 600 !important;
    border-bottom: none !important;
    padding-bottom: 0 !important;
    margin-top: 12pt !important;
    margin-bottom: 6pt !important;
  }
</style>`

async function prepareForPdf(html: string, baseUrl: string): Promise<string> {
  let result = html

  const stylesheetTags = result.match(STYLESHEET_RE) ?? []

  for (const tag of stylesheetTags) {
    const hrefMatch = tag.match(HREF_RE)
    if (!hrefMatch?.[1]) continue

    const [, cssUrl] = hrefMatch
    const resolved = new URL(cssUrl, baseUrl)
    resolved.searchParams.set('direct', '')
    const cssResponse = await fetch(resolved)
    if (!cssResponse.ok) continue
    const css = stripCssLayers(await cssResponse.text())
    result = result.replace(tag, `<style>${css}</style>`)
  }

  result = result.replace(SCRIPT_RE, '')
  result = result.replace(PRELOAD_RE, '')
  result = result.replace(PRINT_HIDDEN_RE, '')
  result = result.replace(APP_SEPARATOR_RE, '</main>')
  result = result.replace(TABLE_SEPARATOR_TR_RE, '')

  result = forceLightMode(result)
  result = result.replace('</head>', `${PDF_OVERRIDES}\n</head>`)

  return result
}

export { stripCssLayers, forceLightMode, prepareForPdf }
