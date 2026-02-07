<!-- pages/cleanings/[id].vue -->
<script setup lang="ts">
import type { CleaningRecord } from '~/shared/types'
import { updateCleaningSchema } from '~/shared/validation'

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

const { data: cleaning, error: fetchError } = await useFetch<CleaningRecord>(
  `/api/cleanings/${id}`,
)

if (fetchError.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Запись не найдена',
  })
}

const form = reactive({
  cleaningDate: cleaning.value!.cleaningDate,
  cleaningType: cleaning.value!.cleaningType,
  notes: cleaning.value!.notes ?? '',
})

const errors = ref<Record<string, string[]>>({})
const loading = ref(false)

async function handleUpdate() {
  const parsed = updateCleaningSchema.safeParse(form)
  if (!parsed.success) {
    errors.value = parsed.error.flatten().fieldErrors
    return
  }
  errors.value = {}

  loading.value = true
  try {
    await $fetch(`/api/cleanings/${id}`, {
      method: 'PUT',
      body: parsed.data,
    })
    await router.push('/cleanings')
  } catch (e: any) {
    if (e.data?.data) errors.value = e.data.data
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  if (!confirm('Удалить запись?')) return
  await $fetch(`/api/cleanings/${id}`, { method: 'DELETE' })
  await router.push('/cleanings')
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Редактирование записи</h1>
      <UButton color="red" variant="soft" @click="handleDelete">
        🗑 Удалить
      </UButton>
    </div>

    <UCard>
      <form @submit.prevent="handleUpdate" class="space-y-4">
        <UFormGroup label="Дата" :error="errors.cleaningDate?.[0]">
          <UInput v-model="form.cleaningDate" type="date" />
        </UFormGroup>

        <UFormGroup label="Тип чистки" :error="errors.cleaningType?.[0]">
          <URadioGroup
            v-model="form.cleaningType"
            :options="[
              { label: '🔵 От накипи', value: 'DESCALING' },
              { label: '🟡 От масел', value: 'DEGREASING' },
              { label: '🟣 Комплексная', value: 'COMPLEX' },
            ]"
          />
        </UFormGroup>

        <UFormGroup label="Заметки" :error="errors.notes?.[0]">
          <UTextarea v-model="form.notes" :rows="3" />
        </UFormGroup>

        <div class="flex gap-3">
          <UButton type="submit" :loading="loading">💾 Сохранить</UButton>
          <UButton variant="soft" @click="router.push('/cleanings')">
            Отмена
          </UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>
