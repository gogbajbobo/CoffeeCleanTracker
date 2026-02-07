# CoffeeClean Tracker — Техническая спецификация

> **Фреймворк:** Nuxt 3 (Vue 3, Composition API, TypeScript)
> **Версия документа:** 1.0
> **Дата:** 07.02.2026

---

## 1. Описание продукта

Веб-приложение для учёта дат проведения чисток кофемашины **Bosch VeroCafe TES50328RW/12**. Многопользовательское, с закрытым доступом (только авторизованные пользователи).

### Функциональные требования

| ID   | Требование                                                                                 |
| ---- | ------------------------------------------------------------------------------------------ |
| FR-1 | Регистрация и аутентификация пользователей (email + пароль)                                |
| FR-2 | Закрытый доступ: неавторизованные пользователи перенаправляются на `/login`                |
| FR-3 | Создание записи о чистке: дата, тип, текстовая заметка                                     |
| FR-4 | Три типа чисток: от накипи (`DESCALING`), от масел (`DEGREASING`), комплексная (`COMPLEX`) |
| FR-5 | Просмотр списка всех чисток с фильтрацией по типу и диапазону дат                          |
| FR-6 | Редактирование и удаление своих записей                                                    |
| FR-7 | Dashboard со сводкой: последняя чистка каждого типа, дней с прошлой чистки                 |
| FR-8 | Статистика: среднее/медианное время между чистками, прогноз следующей чистки               |
| FR-9 | Визуализация статистики в виде графиков                                                    |

### Бизнес-правило: тип COMPLEX

Комплексная чистка (`COMPLEX`) означает одновременную чистку от накипи и от масел. При расчёте статистики по типу `DESCALING` учитываются записи `DESCALING` **и** `COMPLEX`. Аналогично для `DEGREASING`. При запросе статистики по `COMPLEX` — учитываются только `COMPLEX`.

---

## 2. Стек технологий

| Слой           | Технология                       | Версия | Назначение                            |
| -------------- | -------------------------------- | ------ | ------------------------------------- |
| Фреймворк      | **Nuxt 3**                       | 3.x    | SSR, маршрутизация, server API        |
| UI-фреймворк   | **Vue 3**                        | 3.x    | Composition API, `<script setup>`     |
| Язык           | **TypeScript**                   | 5.x    | Сквозная типизация                    |
| ORM            | **Prisma**                       | 6.x    | Type-safe доступ к БД, миграции       |
| БД             | **PostgreSQL**                   | 16     | Продакшн                              |
| БД (dev)       | **SQLite**                       | —      | Локальная разработка без зависимостей |
| Валидация      | **Zod**                          | 3.x    | Единые схемы для клиента и сервера    |
| Аутентификация | **nuxt-auth-utils**              | latest | Сессии через secure cookies           |
| Хэширование    | **bcrypt**                       | —      | Хэширование паролей                   |
| UI-библиотека  | **Nuxt UI** (или **shadcn-vue**) | latest | Готовые компоненты                    |
| Стили          | **Tailwind CSS**                 | 3.x    | Утилитарные стили                     |
| Графики        | **vue-chartjs** + **Chart.js**   | 4.x    | Визуализация статистики               |
| Деплой         | **Docker** + **docker-compose**  | —      | Контейнеризация                       |

---

## 3. Структура проекта

```
coffeeclean/
│
├── prisma/
│   ├── schema.prisma                  # Схема БД
│   ├── seed.ts                        # Начальные данные
│   └── migrations/                    # Автогенерируемые миграции
│
├── server/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register.post.ts       # POST /api/auth/register
│   │   │   ├── login.post.ts          # POST /api/auth/login
│   │   │   └── logout.post.ts         # POST /api/auth/logout
│   │   │
│   │   ├── cleanings/
│   │   │   ├── index.get.ts           # GET    /api/cleanings
│   │   │   ├── index.post.ts          # POST   /api/cleanings
│   │   │   ├── [id].get.ts            # GET    /api/cleanings/:id
│   │   │   ├── [id].put.ts            # PUT    /api/cleanings/:id
│   │   │   └── [id].delete.ts         # DELETE /api/cleanings/:id
│   │   │
│   │   └── statistics/
│   │       ├── summary.get.ts         # GET /api/statistics/summary?type=
│   │       └── prediction.get.ts      # GET /api/statistics/prediction?type=
│   │
│   ├── middleware/
│   │   └── auth.ts                    # Серверный middleware: проверка сессии
│   │
│   └── utils/
│       ├── db.ts                      # Prisma client singleton
│       └── auth.ts                    # Утилиты хэширования, сессий
│
├── shared/
│   ├── types.ts                       # Общие типы (клиент + сервер)
│   ├── validation.ts                  # Zod-схемы (клиент + сервер)
│   └── statistics.ts                  # Чистые функции расчёта статистики
│
├── pages/
│   ├── login.vue                      # Страница входа
│   ├── register.vue                   # Страница регистрации
│   ├── index.vue                      # Redirect → /dashboard
│   ├── dashboard.vue                  # Сводная панель
│   ├── cleanings/
│   │   ├── index.vue                  # Список чисток + форма создания
│   │   └── [id].vue                   # Просмотр / редактирование
│   └── statistics.vue                 # Графики и аналитика
│
├── components/
│   ├── AppNavbar.vue                  # Навигация
│   ├── CleaningForm.vue               # Форма создания/редактирования
│   ├── CleaningTable.vue              # Таблица чисток
│   ├── StatsCard.vue                  # Карточка статистики по типу
│   ├── StatsChart.vue                 # График (Chart.js)
│   └── PredictionBadge.vue            # Бейдж прогноза
│
├── composables/
│   ├── useCleanings.ts                # CRUD-операции, реактивные данные
│   └── useStatistics.ts               # Загрузка и форматирование статистики
│
├── middleware/
│   └── auth.global.ts                 # Клиентский guard: редирект на /login
│
├── layouts/
│   ├── default.vue                    # Layout с навбаром (для авторизованных)
│   └── auth.vue                       # Минимальный layout (login/register)
│
├── public/
│   └── favicon.ico
│
├── app.vue                            # Корневой компонент
├── nuxt.config.ts                     # Конфигурация Nuxt
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .env                               # Переменные окружения (НЕ в git)
├── .env.example                       # Шаблон переменных
├── Dockerfile
└── docker-compose.yml
```

---

## 4. Модель данных

### 4.1. Prisma-схема

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum CleaningType {
  DESCALING
  DEGREASING
  COMPLEX
}

model User {
  id           String     @id @default(cuid())
  name         String
  email        String     @unique
  passwordHash String     @map("password_hash")
  isActive     Boolean    @default(true) @map("is_active")
  createdAt    DateTime   @default(now()) @map("created_at")

  cleanings    Cleaning[]

  @@map("users")
}

model Cleaning {
  id           String       @id @default(cuid())
  userId       String       @map("user_id")
  cleaningDate DateTime     @map("cleaning_date") @db.Date
  cleaningType CleaningType @map("cleaning_type")
  notes        String?
  createdAt    DateTime     @default(now()) @map("created_at")

  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, cleaningDate, cleaningType])
  @@index([cleaningType, cleaningDate(sort: Desc)])
  @@index([userId])
  @@map("cleanings")
}
```

### 4.2. ER-диаграмма

```
┌──────────────────┐         ┌──────────────────────────┐
│      users       │         │       cleanings          │
├──────────────────┤         ├──────────────────────────┤
│ id          PK   │───┐     │ id              PK       │
│ name             │   │     │ user_id         FK ──────│──→ users.id
│ email        UQ  │   └────►│ cleaning_date            │
│ password_hash    │         │ cleaning_type   ENUM     │
│ is_active        │         │ notes                    │
│ created_at       │         │ created_at               │
└──────────────────┘         │                          │
                             │ UQ(user_id, cleaning_date│
                             │    cleaning_type)        │
                             └──────────────────────────┘
```

---

## 5. Общий код (директория `shared/`)

Этот код импортируется **и на сервере, и на клиенте** — не должен содержать серверных зависимостей.

### 5.1. Типы

```typescript
// shared/types.ts

export type CleaningType = 'DESCALING' | 'DEGREASING' | 'COMPLEX'

export const CLEANING_TYPE_LABELS: Record<CleaningType, string> = {
  DESCALING: 'От накипи',
  DEGREASING: 'От масел',
  COMPLEX: 'Комплексная',
}

export const CLEANING_TYPE_ICONS: Record<CleaningType, string> = {
  DESCALING: '🔵',
  DEGREASING: '🟡',
  COMPLEX: '🟣',
}

export interface CleaningRecord {
  id: string
  cleaningDate: string // "YYYY-MM-DD"
  cleaningType: CleaningType
  notes: string | null
  createdAt: string // ISO datetime
  user: {
    id: string
    name: string
  }
}

export interface CleaningStats {
  cleaningType: CleaningType
  totalCleanings: number
  lastCleaning: {
    date: string
    daysAgo: number
  } | null
  averageIntervalDays: number | null
  medianIntervalDays: number | null
  prediction: {
    date: string
    daysUntil: number
    isOverdue: boolean
  } | null
}

export interface CleaningFilters {
  type?: CleaningType
  dateFrom?: string
  dateTo?: string
  page?: number
  perPage?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}
```

### 5.2. Валидация (Zod)

```typescript
// shared/validation.ts

import { z } from 'zod'

export const cleaningTypeEnum = z.enum(['DESCALING', 'DEGREASING', 'COMPLEX'])

export const createCleaningSchema = z.object({
  cleaningDate: z.string().date('Некорректный формат даты'),
  cleaningType: cleaningTypeEnum,
  notes: z.string().max(500, 'Максимум 500 символов').nullable().optional(),
})

export const updateCleaningSchema = createCleaningSchema.partial()

export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Минимум 2 символа').max(50),
    email: z.string().email('Некорректный email'),
    password: z.string().min(8, 'Минимум 8 символов'),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Пароли не совпадают',
    path: ['passwordConfirm'],
  })

// Выводимые типы — один источник правды
export type CreateCleaningInput = z.infer<typeof createCleaningSchema>
export type UpdateCleaningInput = z.infer<typeof updateCleaningSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
```

### 5.3. Статистика (чистые функции)

```typescript
// shared/statistics.ts

import type { CleaningStats, CleaningType } from './types'

/**
 * Рассчитывает статистику по массиву дат чисток.
 * Чистая функция без побочных эффектов — работает и на сервере, и на клиенте.
 */
export function calculateStats(
  dates: Date[],
  type: CleaningType,
  now: Date = new Date(),
): CleaningStats {
  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime())

  if (sorted.length === 0) {
    return {
      cleaningType: type,
      totalCleanings: 0,
      lastCleaning: null,
      averageIntervalDays: null,
      medianIntervalDays: null,
      prediction: null,
    }
  }

  const last = sorted[sorted.length - 1]
  const daysAgo = diffDays(last, now)

  const intervals = computeIntervals(sorted)
  const avg = intervals.length > 0 ? mean(intervals) : null
  const med = intervals.length > 0 ? median(intervals) : null

  let prediction = null
  if (intervals.length >= 1) {
    const ewa = exponentialWeightedAvg(intervals, 0.3)
    const predDate = addDays(last, Math.round(ewa))
    prediction = {
      date: formatDate(predDate),
      daysUntil: diffDays(now, predDate),
      isOverdue: predDate < now,
    }
  }

  return {
    cleaningType: type,
    totalCleanings: sorted.length,
    lastCleaning: { date: formatDate(last), daysAgo },
    averageIntervalDays: avg !== null ? round1(avg) : null,
    medianIntervalDays: med,
    prediction,
  }
}

/**
 * Фильтрует записи, относящиеся к эффективному типу чистки.
 * DESCALING  → DESCALING + COMPLEX
 * DEGREASING → DEGREASING + COMPLEX
 * COMPLEX    → только COMPLEX
 */
export function filterByEffectiveType<T extends { cleaningType: string }>(
  records: T[],
  type: CleaningType,
): T[] {
  if (type === 'COMPLEX') {
    return records.filter((r) => r.cleaningType === 'COMPLEX')
  }
  return records.filter(
    (r) => r.cleaningType === type || r.cleaningType === 'COMPLEX',
  )
}

// ── Вспомогательные функции ────────────────────────

function computeIntervals(sortedDates: Date[]): number[] {
  const intervals: number[] = []
  for (let i = 1; i < sortedDates.length; i++) {
    intervals.push(diffDays(sortedDates[i - 1], sortedDates[i]))
  }
  return intervals
}

function exponentialWeightedAvg(values: number[], alpha: number): number {
  let ewa = values[0]
  for (let i = 1; i < values.length; i++) {
    ewa = alpha * values[i] + (1 - alpha) * ewa
  }
  return ewa
}

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length
}

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2)
}

function diffDays(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / 86_400_000)
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000)
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}
```

---

## 6. Серверная часть

### 6.1. Prisma-клиент (синглтон)

```typescript
// server/utils/db.ts

import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

declare global {
  var __prisma: PrismaClient | undefined
}

// В dev-режиме переиспользуем клиент, чтобы не плодить соединения при HMR
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient()
  }
  prisma = global.__prisma
}

export { prisma }
```

### 6.2. Серверный middleware аутентификации

```typescript
// server/middleware/auth.ts

import { H3Event } from 'h3'

const PUBLIC_PATHS = ['/api/auth/login', '/api/auth/register']

export default defineEventHandler(async (event: H3Event) => {
  const path = getRequestURL(event).pathname

  // Пропускаем публичные маршруты и не-API запросы
  if (!path.startsWith('/api/') || PUBLIC_PATHS.includes(path)) {
    return
  }

  // Проверяем сессию через nuxt-auth-utils
  const session = await getUserSession(event)

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }
})
```

### 6.3. API-маршруты

#### Аутентификация

```typescript
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
```

```typescript
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
```

```typescript
// server/api/auth/logout.post.ts

export default defineEventHandler(async (event) => {
  await clearUserSession(event)
  return { ok: true }
})
```

#### CRUD чисток

```typescript
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
```

```typescript
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
```

```typescript
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
```

```typescript
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
```

#### Статистика

```typescript
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
```

---

## 7. Клиентская часть

### 7.1. Конфигурация Nuxt

```typescript
// nuxt.config.ts

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui', // Nuxt UI (включает Tailwind)
    'nuxt-auth-utils', // Аутентификация через сессии
  ],

  runtimeConfig: {
    // Доступны ТОЛЬКО на сервере
    databaseUrl: process.env.DATABASE_URL,
    authSecret: process.env.NUXT_AUTH_SECRET,
    bcryptRounds: 12,

    // Доступны и на сервере, и на клиенте
    public: {
      appName: 'CoffeeClean Tracker',
      machineName: 'Bosch VeroCafe TES50328RW/12',
    },
  },

  typescript: {
    strict: true,
  },
})
```

### 7.2. Клиентский middleware (guard)

```typescript
// middleware/auth.global.ts

export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()

  const publicPages = ['/login', '/register']

  if (!loggedIn.value && !publicPages.includes(to.path)) {
    return navigateTo('/login')
  }

  // Если уже залогинен — не пускаем на login/register
  if (loggedIn.value && publicPages.includes(to.path)) {
    return navigateTo('/dashboard')
  }
})
```

### 7.3. Layouts

```vue
<!-- layouts/auth.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-stone-100">
    <div class="w-full max-w-md p-8">
      <h1 class="text-2xl font-bold text-center mb-2">☕ CoffeeClean</h1>
      <p class="text-center text-stone-500 mb-8">
        {{ $config.public.machineName }}
      </p>
      <slot />
    </div>
  </div>
</template>
```

```vue
<!-- layouts/default.vue -->
<template>
  <div class="min-h-screen bg-stone-50">
    <AppNavbar />
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
</template>
```

### 7.4. Страницы

```vue
<!-- pages/login.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { fetch: refreshSession } = useUserSession()

const form = reactive({ email: '', password: '' })
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  error.value = ''

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: form,
    })
    await refreshSession()
    await navigateTo('/dashboard')
  } catch (e: any) {
    error.value = e.data?.statusMessage || 'Ошибка входа'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleLogin" class="space-y-4">
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Вход</h2>
      </template>

      <div class="space-y-4">
        <UFormGroup label="Email">
          <UInput v-model="form.email" type="email" required />
        </UFormGroup>

        <UFormGroup label="Пароль">
          <UInput v-model="form.password" type="password" required />
        </UFormGroup>

        <UAlert v-if="error" color="red" :title="error" />
      </div>

      <template #footer>
        <div class="flex flex-col gap-3">
          <UButton type="submit" block :loading="loading"> Войти </UButton>
          <NuxtLink to="/register" class="text-center text-sm text-primary">
            Нет аккаунта? Зарегистрироваться
          </NuxtLink>
        </div>
      </template>
    </UCard>
  </form>
</template>
```

```vue
<!-- pages/dashboard.vue -->
<script setup lang="ts">
import type { CleaningStats, CleaningType } from '~/shared/types'
import { CLEANING_TYPE_LABELS, CLEANING_TYPE_ICONS } from '~/shared/types'

// SSR: данные загружаются на сервере до рендеринга
const { data: stats } = await useFetch<CleaningStats[]>(
  '/api/statistics/summary',
)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">☕ {{ $config.public.machineName }}</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatsCard v-for="s in stats" :key="s.cleaningType" :stats="s" />
    </div>

    <!-- Быстрая форма добавления -->
    <CleaningForm @created="refreshNuxtData()" />
  </div>
</template>
```

```vue
<!-- pages/cleanings/index.vue -->
<script setup lang="ts">
import type {
  CleaningRecord,
  CleaningFilters,
  PaginatedResponse,
} from '~/shared/types'

const filters = reactive<CleaningFilters>({
  type: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  page: 1,
  perPage: 20,
})

const { data, refresh } = await useFetch<PaginatedResponse<CleaningRecord>>(
  '/api/cleanings',
  {
    query: filters, // реактивные — при изменении фильтров рефетчится
    watch: [filters],
  },
)

async function handleDelete(id: string) {
  if (!confirm('Удалить запись?')) return
  await $fetch(`/api/cleanings/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Журнал чисток</h1>
    </div>

    <!-- Фильтры -->
    <div class="flex gap-4 mb-6">
      <USelect
        v-model="filters.type"
        :options="[
          { label: 'Все типы', value: undefined },
          { label: '🔵 От накипи', value: 'DESCALING' },
          { label: '🟡 От масел', value: 'DEGREASING' },
          { label: '🟣 Комплексная', value: 'COMPLEX' },
        ]"
        placeholder="Тип чистки"
      />
      <UInput v-model="filters.dateFrom" type="date" placeholder="С даты" />
      <UInput v-model="filters.dateTo" type="date" placeholder="По дату" />
    </div>

    <!-- Таблица -->
    <CleaningTable :records="data?.data ?? []" @delete="handleDelete" />

    <!-- Пагинация -->
    <div class="mt-4 flex justify-center">
      <UPagination
        v-model="filters.page"
        :total="data?.total ?? 0"
        :per-page="filters.perPage!"
      />
    </div>

    <!-- Форма создания -->
    <CleaningForm class="mt-8" @created="refresh()" />
  </div>
</template>
```

```vue
<!-- pages/statistics.vue -->
<script setup lang="ts">
import type { CleaningStats } from '~/shared/types'

const { data: stats } = await useFetch<CleaningStats[]>(
  '/api/statistics/summary',
)

const { data: allCleanings } = await useFetch('/api/cleanings', {
  query: { perPage: 1000 },
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">📊 Статистика</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatsCard v-for="s in stats" :key="s.cleaningType" :stats="s" />
    </div>

    <!-- Клиентский компонент с Chart.js -->
    <ClientOnly>
      <StatsChart :cleanings="allCleanings?.data ?? []" />
      <template #fallback>
        <div class="h-64 bg-stone-100 animate-pulse rounded-xl" />
      </template>
    </ClientOnly>
  </div>
</template>
```

### 7.5. Компоненты

```vue
<!-- components/StatsCard.vue -->
<script setup lang="ts">
import { CLEANING_TYPE_LABELS, CLEANING_TYPE_ICONS } from '~/shared/types'
import type { CleaningStats } from '~/shared/types'

const props = defineProps<{ stats: CleaningStats }>()

const statusColor = computed(() => {
  if (!props.stats.prediction) return 'gray'
  if (props.stats.prediction.isOverdue) return 'red'
  if (props.stats.prediction.daysUntil <= 7) return 'orange'
  return 'green'
})
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <span class="text-xl">{{
          CLEANING_TYPE_ICONS[stats.cleaningType]
        }}</span>
        <span class="font-semibold">{{
          CLEANING_TYPE_LABELS[stats.cleaningType]
        }}</span>
      </div>
    </template>

    <div class="space-y-3">
      <div v-if="stats.lastCleaning">
        <p class="text-sm text-stone-500">Последняя чистка</p>
        <p class="font-medium">{{ stats.lastCleaning.date }}</p>
        <p class="text-sm text-stone-600">
          {{ stats.lastCleaning.daysAgo }} дн. назад
        </p>
      </div>
      <div v-else>
        <p class="text-stone-400 italic">Нет данных</p>
      </div>

      <div v-if="stats.averageIntervalDays">
        <p class="text-sm text-stone-500">Средний интервал</p>
        <p class="font-medium">{{ stats.averageIntervalDays }} дн.</p>
      </div>

      <div v-if="stats.prediction">
        <p class="text-sm text-stone-500">Прогноз</p>
        <PredictionBadge :prediction="stats.prediction" />
      </div>
    </div>

    <template #footer>
      <p class="text-xs text-stone-400">
        Всего чисток: {{ stats.totalCleanings }}
      </p>
    </template>
  </UCard>
</template>
```

```vue
<!-- components/CleaningForm.vue -->
<script setup lang="ts">
import { createCleaningSchema } from '~/shared/validation'
import { CLEANING_TYPE_LABELS } from '~/shared/types'

const emit = defineEmits<{ created: [] }>()

const form = reactive({
  cleaningDate: new Date().toISOString().split('T')[0],
  cleaningType: 'DESCALING' as const,
  notes: '',
})

const errors = ref<Record<string, string[]>>({})
const loading = ref(false)

async function handleSubmit() {
  // Валидация на клиенте (тем же Zod!)
  const parsed = createCleaningSchema.safeParse(form)
  if (!parsed.success) {
    errors.value = parsed.error.flatten().fieldErrors
    return
  }
  errors.value = {}

  loading.value = true
  try {
    await $fetch('/api/cleanings', {
      method: 'POST',
      body: parsed.data,
    })
    emit('created')

    // Сброс формы
    form.notes = ''
    form.cleaningDate = new Date().toISOString().split('T')[0]
  } catch (e: any) {
    if (e.data?.data) errors.value = e.data.data
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <h2 class="font-semibold">Записать чистку</h2>
    </template>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <UFormGroup label="Дата" :error="errors.cleaningDate?.[0]">
        <UInput v-model="form.cleaningDate" type="date" />
      </UFormGroup>

      <UFormGroup label="Тип чистки" :error="errors.cleaningType?.[0]">
        <URadioGroup
          v-model="form.cleaningType"
          :options="[
            { label: '🔵 От накипи', value: 'DESCALING' },
            { label: '🟡 От масел', value: 'DEGREASING' },
            { label: '🟣 Комплексная', value: 'COMPLEX' },
          ]"
        />
      </UFormGroup>

      <UFormGroup label="Заметки" :error="errors.notes?.[0]">
        <UTextarea
          v-model="form.notes"
          placeholder="Какое средство использовали, особенности..."
          :rows="2"
        />
      </UFormGroup>

      <UButton type="submit" block :loading="loading"> 💾 Сохранить </UButton>
    </form>
  </UCard>
</template>
```

```vue
<!-- components/StatsChart.vue -->
<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import type { CleaningRecord } from '~/shared/types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{ cleanings: CleaningRecord[] }>()

const chartData = computed(() => {
  // Группировка по месяцам
  const months = new Map<
    string,
    { descaling: number; degreasing: number; complex: number }
  >()

  for (const c of props.cleanings) {
    const month = c.cleaningDate.substring(0, 7) // "YYYY-MM"
    if (!months.has(month)) {
      months.set(month, { descaling: 0, degreasing: 0, complex: 0 })
    }
    const m = months.get(month)!
    if (c.cleaningType === 'DESCALING') m.descaling++
    if (c.cleaningType === 'DEGREASING') m.degreasing++
    if (c.cleaningType === 'COMPLEX') m.complex++
  }

  const labels = [...months.keys()].sort()

  return {
    labels,
    datasets: [
      {
        label: '🔵 От накипи',
        data: labels.map((l) => months.get(l)!.descaling),
        backgroundColor: '#60a5fa',
      },
      {
        label: '🟡 От масел',
        data: labels.map((l) => months.get(l)!.degreasing),
        backgroundColor: '#fbbf24',
      },
      {
        label: '🟣 Комплексная',
        data: labels.map((l) => months.get(l)!.complex),
        backgroundColor: '#a78bfa',
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  plugins: {
    title: { display: true, text: 'Чистки по месяцам' },
  },
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 1 } },
  },
}
</script>

<template>
  <UCard>
    <Bar :data="chartData" :options="chartOptions" />
  </UCard>
</template>
```

### 7.6. Composable

```typescript
// composables/useCleanings.ts

import type {
  CleaningRecord,
  PaginatedResponse,
  CreateCleaningInput,
} from '~/shared/types'

export function useCleanings() {
  const cleanings = ref<CleaningRecord[]>([])
  const loading = ref(false)

  async function fetchCleanings(params?: Record<string, any>) {
    loading.value = true
    try {
      const res = await $fetch<PaginatedResponse<CleaningRecord>>(
        '/api/cleanings',
        { query: params },
      )
      cleanings.value = res.data
      return res
    } finally {
      loading.value = false
    }
  }

  async function createCleaning(input: CreateCleaningInput) {
    return $fetch('/api/cleanings', { method: 'POST', body: input })
  }

  async function deleteCleaning(id: string) {
    return $fetch(`/api/cleanings/${id}`, { method: 'DELETE' })
  }

  return { cleanings, loading, fetchCleanings, createCleaning, deleteCleaning }
}
```

---

## 8. Переменные окружения

```bash
# .env.example

# БД
DATABASE_URL="postgresql://coffeeclean:secret@localhost:5432/coffeeclean"

# Секрет для подписи cookie-сессий (сгенерировать: openssl rand -hex 32)
NUXT_AUTH_SECRET="your-secret-key-min-32-chars"

# Среда
NODE_ENV="development"
```

---

## 9. Деплой

### docker-compose.yml

```yaml
version: '3.9'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      DATABASE_URL: postgresql://coffeeclean:${DB_PASSWORD}@db:5432/coffeeclean
      NUXT_AUTH_SECRET: ${AUTH_SECRET}
      NODE_ENV: production
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: coffeeclean
      POSTGRES_USER: coffeeclean
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U coffeeclean']
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  pgdata:
```

### Dockerfile

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/.output ./.output
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma

ENV NODE_ENV=production
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node .output/server/index.mjs"]
```

---

## 10. Команды разработки

```bash
# Первоначальная настройка
git clone <repo>
cd coffeeclean
cp .env.example .env           # Заполнить переменные
npm install
npx prisma migrate dev         # Создать БД и применить миграции
npx prisma db seed             # (опционально) тестовые данные

# Разработка
npm run dev                    # http://localhost:3000

# Продакшн
docker-compose up -d --build
```

---

## 11. Прогноз по срокам

| Этап                            | Оценка                  |
| ------------------------------- | ----------------------- |
| Настройка проекта, Prisma, auth | 4–6 ч                   |
| CRUD чисток (API + UI)          | 4–6 ч                   |
| Dashboard + StatsCard           | 3–4 ч                   |
| Страница статистики + графики   | 4–5 ч                   |
| Стили, полировка, edge-cases    | 3–4 ч                   |
| Docker, деплой                  | 2–3 ч                   |
| **Итого**                       | **~20–28 ч (~3–4 дня)** |
