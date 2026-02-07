// server/api/statistics/prediction.get.ts

import { prisma } from '~/server/utils/db'
import { calculateStats, filterByEffectiveType } from '~/shared/statistics'
import type { CleaningType } from '~/shared/types'
import { cleaningTypeEnum } from '~/shared/validation'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const parsed = cleaningTypeEnum.safeParse(query.type)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Параметр type обязателен: DESCALING | DEGREASING | COMPLEX',
    })
  }

  const type: CleaningType = parsed.data

  const cleanings = await prisma.cleaning.findMany({
    orderBy: { cleaningDate: 'asc' },
    select: { cleaningDate: true, cleaningType: true },
  })

  const relevant = filterByEffectiveType(cleanings, type)
  const dates = relevant.map((c) => c.cleaningDate)
  const stats = calculateStats(dates, type)

  if (!stats.prediction) {
    return {
      cleaningType: type,
      prediction: null,
      message: 'Недостаточно данных для прогноза (нужно минимум 2 чистки)',
    }
  }

  return {
    cleaningType: type,
    prediction: stats.prediction,
  }
})
