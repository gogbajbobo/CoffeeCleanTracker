// server/api/cleanings/[id].put.ts

import { prisma } from '~/server/utils/db'
import { updateCleaningSchema } from '~/shared/validation'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  // Проверяем, что запись принадлежит пользователю
  const existing = await prisma.cleaning.findUnique({ where: { id } })

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Запись не найдена' })
  }
  if (existing.userId !== session.user!.id) {
    throw createError({ statusCode: 403, statusMessage: 'Нет доступа' })
  }

  const parsed = updateCleaningSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      data: parsed.error.flatten().fieldErrors,
    })
  }

  const updated = await prisma.cleaning.update({
    where: { id },
    data: {
      ...(parsed.data.cleaningDate && {
        cleaningDate: new Date(parsed.data.cleaningDate),
      }),
      ...(parsed.data.cleaningType && {
        cleaningType: parsed.data.cleaningType,
      }),
      ...(parsed.data.notes !== undefined && { notes: parsed.data.notes }),
    },
  })

  return updated
})
