import type { MinimarkBody } from './types'

const SELF_CLOSING = new Set(['br', 'hr', 'img', 'input', 'meta', 'link', 'col', 'area', 'source', 'track', 'wbr'])

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, ch => ESCAPE_MAP[ch]!)
}

function renderAttributes(attrs: Record<string, unknown>): string {
  const parts: string[] = []
  for (const [key, value] of Object.entries(attrs)) {
    if (value === true) parts.push(` ${key}`)
    else if (value !== false && value != undefined) parts.push(` ${key}="${escapeHtml(String(value))}"`)
  }
  return parts.join('')
}

function minimarkToHtml(nodes: unknown[]): string {
  return nodes.map(node => {
    if (typeof node === 'string') return escapeHtml(node)
    if (!Array.isArray(node)) return ''

    const [tag, attrs, ...children] = node as [string, Record<string, unknown>, ...unknown[]]
    const attrStr = attrs ? renderAttributes(attrs) : ''

    if (SELF_CLOSING.has(tag)) return `<${tag}${attrStr} />`
    return `<${tag}${attrStr}>${minimarkToHtml(children)}</${tag}>`
  }).join('')
}

function bodyToHtml(body: MinimarkBody | undefined): string {
  if (!body?.value) return ''
  return minimarkToHtml(body.value)
}

export { bodyToHtml, minimarkToHtml }
