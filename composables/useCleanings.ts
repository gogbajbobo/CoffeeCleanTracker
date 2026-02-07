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
