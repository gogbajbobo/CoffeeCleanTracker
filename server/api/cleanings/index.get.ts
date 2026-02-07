// server/api/cleanings/index.get.ts

import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const query = getQuery(event)

  const page = Number(query.page) || 1
  const perPage = Math.min(Number(query.perPage) || 20, 50)
  const skip = (page - 1) * perPage

  // Фильтры
  const where: any = {}

  if (query.type) {
    where.cleaningType = query.type
  }
  if (query.dateFrom) {
    where.cleaningDate = {
      ...where.cleaningDate,
      gte: new Date(query.dateFrom as string),
    }
  }
  if (query.dateTo) {
    where.cleaningDate = {
      ...where.cleaningDate,
      lte: new Date(query.dateTo as string),
    }
  }

  const [data, total] = await Promise.all([
    prisma.cleaning.findMany({
      where,
      include: { user: { select: { id: true, name: true } } },
      orderBy: { cleaningDate: 'desc' },
      skip,
      take: perPage,
    }),
    prisma.cleaning.count({ where }),
  ])

  return {
    data: data.map((c) => ({
      id: c.id,
      cleaningDate: c.cleaningDate.toISOString().split('T')[0],
      cleaningType: c.cleaningType,
      notes: c.notes,
      createdAt: c.createdAt.toISOString(),
      user: c.user,
    })),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  }
})
