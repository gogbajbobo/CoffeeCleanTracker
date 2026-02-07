// server/middleware/auth.ts

import { H3Event } from 'h3'

const PUBLIC_PATHS = ['/api/auth/login', '/api/auth/register']

export default defineEventHandler(async (event: H3Event) => {
  const path = getRequestURL(event).pathname

  // Пропускаем публичные маршруты и не-API запросы
  if (!path.startsWith('/api/') || PUBLIC_PATHS.includes(path)) {
    return
  }

  // Проверяем сессию через nuxt-auth-utils
  const session = await getUserSession(event)

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }
})
