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
