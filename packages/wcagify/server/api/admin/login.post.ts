import { getAdminSecret } from '../../utils/shares'

export default defineEventHandler(async (event) => {
  const secret = getAdminSecret()
  if (!secret) {
    throw createError({ statusCode: 404, statusMessage: 'Admin not configured' })
  }

  const body = await readBody<{ secret?: string }>(event)
  if (!body?.secret || body.secret !== secret) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid admin secret' })
  }

  setCookie(event, 'wcagify-admin', secret, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/api/shares',
    maxAge: 60 * 60 * 24 * 365
  })

  return { ok: true }
})
