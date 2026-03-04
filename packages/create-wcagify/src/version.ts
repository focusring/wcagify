import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8')) as {
  version: string
}

export const CLI_VERSION = pkg.version

const WCAGIFY_FALLBACK_VERSION = '0.1.0'

interface NpmVersionResponse {
  'dist-tags': {
    latest: string
  }
}

export async function fetchLatestWcagifyVersion(): Promise<string> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch('https://registry.npmjs.org/@focusring/wcagify', {
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) return WCAGIFY_FALLBACK_VERSION

    const data = (await response.json()) as NpmVersionResponse
    return data['dist-tags'].latest
  } catch {
    return WCAGIFY_FALLBACK_VERSION
  }
}
