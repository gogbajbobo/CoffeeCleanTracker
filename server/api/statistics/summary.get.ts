// server/api/statistics/summary.get.ts

import { prisma } from '~/server/utils/db'
import { calculateStats, filterByEffectiveType } from '~/shared/statistics'
import type { CleaningType } from '~/shared/types'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const requestedType = query.type as CleaningType | undefined

  const cleanings = await prisma.cleaning.findMany({
    orderBy: { cleaningDate: 'asc' },
    select: { cleaningDate: true, cleaningType: true },
  })

  const types: CleaningType[] = requestedType
    ? [requestedType]
    : ['DESCALING', 'DEGREASING', 'COMPLEX']

  return types.map((type) => {
    const relevant = filterByEffectiveType(cleanings, type)
    const dates = relevant.map((c) => c.cleaningDate)
    return calculateStats(dates, type)
  })
})
