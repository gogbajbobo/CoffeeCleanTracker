// server/api/cleanings/index.post.ts

import { prisma } from '~/server/utils/db'
import { createCleaningSchema } from '~/shared/validation'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const body = await readBody(event)

  const parsed = createCleaningSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      data: parsed.error.flatten().fieldErrors,
    })
  }

  const cleaning = await prisma.cleaning.create({
    data: {
      userId: session.user!.id,
      cleaningDate: new Date(parsed.data.cleaningDate),
      cleaningType: parsed.data.cleaningType,
      notes: parsed.data.notes ?? null,
    },
  })

  return {
    id: cleaning.id,
    cleaningDate: cleaning.cleaningDate.toISOString().split('T')[0],
    cleaningType: cleaning.cleaningType,
    notes: cleaning.notes,
  }
})
