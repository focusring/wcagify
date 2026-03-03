export async function generatePdf(
  html: string,
  filename: string,
  weasyprintUrl: string
): Promise<Uint8Array> {
  const response = await fetch(`${weasyprintUrl}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      html,
      variant: 'pdf/ua-1',
      filename,
      presentational_hints: true
    }),
    signal: AbortSignal.timeout(60_000)
  })

  if (!response.ok) {
    throw new Error(`WeasyPrint request failed: ${response.status} ${response.statusText}`)
  }

  const buffer = await response.arrayBuffer()
  return new Uint8Array(buffer)
}
