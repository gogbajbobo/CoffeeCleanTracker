<!-- pages/cleanings/index.vue -->
<script setup lang="ts">
import type {
  CleaningRecord,
  CleaningFilters,
  PaginatedResponse,
} from '~/shared/types'

const filters = reactive<CleaningFilters>({
  type: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  page: 1,
  perPage: 20,
})

const { data, refresh } = await useFetch<PaginatedResponse<CleaningRecord>>(
  '/api/cleanings',
  {
    query: filters, // реактивные — при изменении фильтров рефетчится
    watch: [filters],
  },
)

async function handleDelete(id: string) {
  if (!confirm('Удалить запись?')) return
  await $fetch(`/api/cleanings/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Журнал чисток</h1>
    </div>

    <!-- Фильтры -->
    <div class="flex gap-4 mb-6">
      <USelect
        v-model="filters.type"
        :options="[
          { label: 'Все типы', value: undefined },
          { label: '🔵 От накипи', value: 'DESCALING' },
          { label: '🟡 От масел', value: 'DEGREASING' },
          { label: '🟣 Комплексная', value: 'COMPLEX' },
        ]"
        placeholder="Тип чистки"
      />
      <UInput v-model="filters.dateFrom" type="date" placeholder="С даты" />
      <UInput v-model="filters.dateTo" type="date" placeholder="По дату" />
    </div>

    <!-- Таблица -->
    <CleaningTable :records="data?.data ?? []" @delete="handleDelete" />

    <!-- Пагинация -->
    <div class="mt-4 flex justify-center">
      <UPagination
        v-model="filters.page"
        :total="data?.total ?? 0"
        :per-page="filters.perPage!"
      />
    </div>

    <!-- Форма создания -->
    <CleaningForm class="mt-8" @created="refresh()" />
  </div>
</template>
