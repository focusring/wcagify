export async function generatePdf(
  html: string,
  filename: string,
  weasyprintUrl: string
): Promise<Uint8Array> {
  const response = await $fetch<ArrayBuffer>(`${weasyprintUrl}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      html,
      variant: 'pdf/ua-1',
      filename,
      presentational_hints: true
    },
    responseType: 'arrayBuffer',
    timeout: 60_000
  })

  return new Uint8Array(response)
}
