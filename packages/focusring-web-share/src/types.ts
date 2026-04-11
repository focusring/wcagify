import { z } from 'zod'

export const captureStatusSchema = z.enum(['pending', 'capturing', 'captured', 'failed'])

export const capturedPageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  title: z.string(),
  faviconUrl: z.string().optional(),
  addedAt: z.number(),
  status: captureStatusSchema,
  sizeBytes: z.number().optional(),
  errorMessage: z.string().optional()
})

export type CapturedPage = z.infer<typeof capturedPageSchema>
