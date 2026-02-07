<!-- pages/register.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { fetch: refreshSession } = useUserSession()

const form = reactive({
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
})
const errors = ref<Record<string, string[]>>({})
const error = ref('')
const loading = ref(false)

async function handleRegister() {
  loading.value = true
  error.value = ''
  errors.value = {}

  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: form,
    })
    await refreshSession()
    await navigateTo('/dashboard')
  } catch (e: any) {
    if (e.data?.data) {
      errors.value = e.data.data
    }
    error.value = e.data?.statusMessage || 'Ошибка регистрации'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleRegister" class="space-y-4">
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Регистрация</h2>
      </template>

      <div class="space-y-4">
        <UFormGroup label="Имя" :error="errors.name?.[0]">
          <UInput v-model="form.name" required />
        </UFormGroup>

        <UFormGroup label="Email" :error="errors.email?.[0]">
          <UInput v-model="form.email" type="email" required />
        </UFormGroup>

        <UFormGroup label="Пароль" :error="errors.password?.[0]">
          <UInput v-model="form.password" type="password" required />
        </UFormGroup>

        <UFormGroup
          label="Подтвердите пароль"
          :error="errors.passwordConfirm?.[0]"
        >
          <UInput v-model="form.passwordConfirm" type="password" required />
        </UFormGroup>

        <UAlert v-if="error" color="red" :title="error" />
      </div>

      <template #footer>
        <div class="flex flex-col gap-3">
          <UButton type="submit" block :loading="loading">
            Зарегистрироваться
          </UButton>
          <NuxtLink to="/login" class="text-center text-sm text-primary">
            Уже есть аккаунт? Войти
          </NuxtLink>
        </div>
      </template>
    </UCard>
  </form>
</template>
