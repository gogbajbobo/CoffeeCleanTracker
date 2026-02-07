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
