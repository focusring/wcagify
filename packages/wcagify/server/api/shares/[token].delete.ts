import { deleteShare } from '../../utils/shares'

export default defineEventHandler((event) => {
  const token = getRouterParam(event, 'token')

  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Missing token' })
  }

  const deleted = deleteShare(token)
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Share not found' })
  }

  setResponseStatus(event, 204)
  return null
})
