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
