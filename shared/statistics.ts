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
