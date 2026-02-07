<!-- components/PredictionBadge.vue -->
<script setup lang="ts">
const props = defineProps<{
  prediction: {
    date: string
    daysUntil: number
    isOverdue: boolean
  }
}>()

const color = computed(() => {
  if (props.prediction.isOverdue) return 'red'
  if (props.prediction.daysUntil <= 7) return 'orange'
  return 'green'
})

const label = computed(() => {
  if (props.prediction.isOverdue) {
    return `Просрочено на ${Math.abs(props.prediction.daysUntil)} дн.`
  }
  return `Через ${props.prediction.daysUntil} дн.`
})
</script>

<template>
  <div class="flex items-center gap-2">
    <UBadge :color="color" variant="soft">
      {{ label }}
    </UBadge>
    <span class="text-sm text-stone-500">{{ prediction.date }}</span>
  </div>
</template>
