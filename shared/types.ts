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
