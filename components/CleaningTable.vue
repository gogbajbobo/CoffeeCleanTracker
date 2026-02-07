<!-- components/CleaningTable.vue -->
<script setup lang="ts">
import { CLEANING_TYPE_LABELS, CLEANING_TYPE_ICONS } from '~/shared/types'
import type { CleaningRecord } from '~/shared/types'

defineProps<{
  records: CleaningRecord[]
}>()

const emit = defineEmits<{
  delete: [id: string]
}>()

const { user } = useUserSession()

const columns = [
  { key: 'cleaningDate', label: 'Дата' },
  { key: 'cleaningType', label: 'Тип' },
  { key: 'notes', label: 'Заметки' },
  { key: 'user', label: 'Автор' },
  { key: 'actions', label: '' },
]
</script>

<template>
  <UTable :columns="columns" :rows="records">
    <template #cleaningDate-data="{ row }">
      <NuxtLink
        :to="`/cleanings/${row.id}`"
        class="text-primary hover:underline font-medium"
      >
        {{ row.cleaningDate }}
      </NuxtLink>
    </template>

    <template #cleaningType-data="{ row }">
      <UBadge variant="soft">
        {{
          CLEANING_TYPE_ICONS[
            row.cleaningType as keyof typeof CLEANING_TYPE_ICONS
          ]
        }}
        {{
          CLEANING_TYPE_LABELS[
            row.cleaningType as keyof typeof CLEANING_TYPE_LABELS
          ]
        }}
      </UBadge>
    </template>

    <template #notes-data="{ row }">
      <span class="text-sm text-stone-500 truncate max-w-xs block">
        {{ row.notes || '—' }}
      </span>
    </template>

    <template #user-data="{ row }">
      <span class="text-sm">{{ row.user.name }}</span>
    </template>

    <template #actions-data="{ row }">
      <div v-if="row.user.id === user?.id" class="flex gap-2 justify-end">
        <UButton size="xs" variant="soft" :to="`/cleanings/${row.id}`">
          ✏️
        </UButton>
        <UButton
          size="xs"
          variant="soft"
          color="red"
          @click="emit('delete', row.id)"
        >
          🗑
        </UButton>
      </div>
    </template>
  </UTable>
</template>
