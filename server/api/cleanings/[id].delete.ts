// server/api/cleanings/[id].delete.ts

import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const id = getRouterParam(event, 'id')!

  const existing = await prisma.cleaning.findUnique({ where: { id } })

  if (!existing) {
    throw createError({ statusCode: 404 })
  }
  if (existing.userId !== session.user!.id) {
    throw createError({ statusCode: 403 })
  }

  await prisma.cleaning.delete({ where: { id } })

  return { ok: true }
})
