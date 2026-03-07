import { getAdminSecret } from '../utils/shares'

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/shares')) return

  const secret = getAdminSecret()
  if (!secret) return

  const cookie = getCookie(event, 'wcagify-admin')
  if (cookie === secret) return

  throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
})
