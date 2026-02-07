// server/api/cleanings/[id].get.ts

import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!

  const cleaning = await prisma.cleaning.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true } } },
  })

  if (!cleaning) {
    throw createError({ statusCode: 404, statusMessage: 'Запись не найдена' })
  }

  return {
    id: cleaning.id,
    cleaningDate: cleaning.cleaningDate.toISOString().split('T')[0],
    cleaningType: cleaning.cleaningType,
    notes: cleaning.notes,
    createdAt: cleaning.createdAt.toISOString(),
    user: cleaning.user,
  }
})
