import { z } from 'zod'

const captureStatusSchema = z.enum(['pending', 'capturing', 'captured', 'failed'])

const capturedPageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  title: z.string(),
  faviconUrl: z.string().optional(),
  addedAt: z.number(),
  status: captureStatusSchema,
  /** Size of the static HTML capture */
  staticSizeBytes: z.number().optional(),
  /** Size of the interactive WARC capture */
  interactiveSizeBytes: z.number().optional(),
  /** Whether the static capture succeeded */
  staticCaptured: z.boolean().optional(),
  /** Whether the interactive capture succeeded */
  interactiveCaptured: z.boolean().optional(),
  errorMessage: z.string().optional()
})

type CapturedPage = z.infer<typeof capturedPageSchema>

/** A single captured HTTP request/response pair from CDP */
interface CdpNetworkRecord {
  url: string
  method: string
  requestHeaders: Record<string, string>
  statusCode: number
  statusText: string
  responseHeaders: Record<string, string>
  responseBody: Uint8Array
  base64Encoded: boolean
  timestamp: number
}

export { captureStatusSchema, capturedPageSchema, type CapturedPage, type CdpNetworkRecord }
