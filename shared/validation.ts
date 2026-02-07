// shared/validation.ts

import { z } from 'zod'

export const cleaningTypeEnum = z.enum(['DESCALING', 'DEGREASING', 'COMPLEX'])

export const createCleaningSchema = z.object({
  cleaningDate: z.iso.date('Некорректный формат даты'),
  cleaningType: cleaningTypeEnum,
  notes: z.string().max(500, 'Максимум 500 символов').nullable().optional(),
})

export const updateCleaningSchema = createCleaningSchema.partial()

export const loginSchema = z.object({
  email: z.email('Некорректный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Минимум 2 символа').max(50),
    email: z.email('Некорректный email'),
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
