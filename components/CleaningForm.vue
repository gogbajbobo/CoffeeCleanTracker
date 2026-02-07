<!-- components/CleaningForm.vue -->
<script setup lang="ts">
import { createCleaningSchema } from '~/shared/validation'
import { CLEANING_TYPE_LABELS } from '~/shared/types'

const emit = defineEmits<{ created: [] }>()

const form = reactive({
  cleaningDate: new Date().toISOString().split('T')[0],
  cleaningType: 'DESCALING' as const,
  notes: '',
})

const errors = ref<Record<string, string[]>>({})
const loading = ref(false)

async function handleSubmit() {
  // Валидация на клиенте (тем же Zod!)
  const parsed = createCleaningSchema.safeParse(form)
  if (!parsed.success) {
    errors.value = parsed.error.flatten().fieldErrors
    return
  }
  errors.value = {}

  loading.value = true
  try {
    await $fetch('/api/cleanings', {
      method: 'POST',
      body: parsed.data,
    })
    emit('created')

    // Сброс формы
    form.notes = ''
    form.cleaningDate = new Date().toISOString().split('T')[0]
  } catch (e: any) {
    if (e.data?.data) errors.value = e.data.data
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <h2 class="font-semibold">Записать чистку</h2>
    </template>

    <form @submit.prevent="handleSubmit" class="space-y-4">
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
        <UTextarea
          v-model="form.notes"
          placeholder="Какое средство использовали, особенности..."
          :rows="2"
        />
      </UFormGroup>

      <UButton type="submit" block :loading="loading"> 💾 Сохранить </UButton>
    </form>
  </UCard>
</template>
