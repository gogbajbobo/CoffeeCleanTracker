// server/api/auth/register.post.ts

import { prisma } from '~/server/utils/db'
import { registerSchema } from '~/shared/validation'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      data: parsed.error.flatten().fieldErrors,
    })
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  })

  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Пользователь с таким email уже существует',
    })
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12)

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
    },
  })

  // Устанавливаем сессию сразу после регистрации
  await setUserSession(event, {
    user: { id: user.id, name: user.name, email: user.email },
  })

  return { id: user.id, name: user.name, email: user.email }
})
