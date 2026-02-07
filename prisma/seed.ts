// prisma/seed.ts

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Тестовый пользователь
  const passwordHash = await bcrypt.hash('password123', 12)

  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      name: 'Тестовый пользователь',
      email: 'test@example.com',
      passwordHash,
    },
  })

  console.log(`✅ Пользователь создан: ${user.email}`)

  // Тестовые чистки за последние полгода
  const cleanings = [
    { daysAgo: 180, type: 'DESCALING' },
    { daysAgo: 150, type: 'DEGREASING' },
    { daysAgo: 120, type: 'COMPLEX' },
    { daysAgo: 90, type: 'DESCALING' },
    { daysAgo: 60, type: 'DEGREASING' },
    { daysAgo: 30, type: 'DESCALING' },
    { daysAgo: 14, type: 'DEGREASING' },
  ] as const

  for (const c of cleanings) {
    const date = new Date()
    date.setDate(date.getDate() - c.daysAgo)
    date.setHours(0, 0, 0, 0)

    await prisma.cleaning.upsert({
      where: {
        userId_cleaningDate_cleaningType: {
          userId: user.id,
          cleaningDate: date,
          cleaningType: c.type,
        },
      },
      update: {},
      create: {
        userId: user.id,
        cleaningDate: date,
        cleaningType: c.type,
        notes: `Тестовая запись — ${c.type}`,
      },
    })
  }

  console.log(`✅ Создано ${cleanings.length} тестовых записей`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
