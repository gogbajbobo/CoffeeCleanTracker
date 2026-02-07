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
