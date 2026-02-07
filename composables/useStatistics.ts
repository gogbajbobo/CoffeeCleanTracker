// composables/useStatistics.ts

import type { CleaningStats, CleaningType } from '~/shared/types'

export function useStatistics() {
  const stats = ref<CleaningStats[]>([])
  const loading = ref(false)

  async function fetchSummary(type?: CleaningType) {
    loading.value = true
    try {
      const query: Record<string, string> = {}
      if (type) query.type = type

      stats.value = await $fetch<CleaningStats[]>('/api/statistics/summary', {
        query,
      })
      return stats.value
    } finally {
      loading.value = false
    }
  }

  async function fetchPrediction(type: CleaningType) {
    return $fetch<{
      cleaningType: CleaningType
      prediction: CleaningStats['prediction']
    }>('/api/statistics/prediction', {
      query: { type },
    })
  }

  return { stats, loading, fetchSummary, fetchPrediction }
}
