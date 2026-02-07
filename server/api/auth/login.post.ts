// server/api/auth/login.post.ts

import { prisma } from '~/server/utils/db'
import { loginSchema } from '~/shared/validation'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = loginSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      data: parsed.error.flatten().fieldErrors,
    })
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  })

  if (!user || !user.isActive) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Неверный email или пароль',
    })
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash)

  if (!valid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Неверный email или пароль',
    })
  }

  await setUserSession(event, {
    user: { id: user.id, name: user.name, email: user.email },
  })

  return { id: user.id, name: user.name, email: user.email }
})
