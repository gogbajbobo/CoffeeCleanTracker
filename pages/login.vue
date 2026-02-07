<!-- pages/login.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { fetch: refreshSession } = useUserSession()

const form = reactive({ email: '', password: '' })
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  error.value = ''

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: form,
    })
    await refreshSession()
    await navigateTo('/dashboard')
  } catch (e: any) {
    error.value = e.data?.statusMessage || 'Ошибка входа'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleLogin" class="space-y-4">
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Вход</h2>
      </template>

      <div class="space-y-4">
        <UFormGroup label="Email">
          <UInput v-model="form.email" type="email" required />
        </UFormGroup>

        <UFormGroup label="Пароль">
          <UInput v-model="form.password" type="password" required />
        </UFormGroup>

        <UAlert v-if="error" color="red" :title="error" />
      </div>

      <template #footer>
        <div class="flex flex-col gap-3">
          <UButton type="submit" block :loading="loading"> Войти </UButton>
          <NuxtLink to="/register" class="text-center text-sm text-primary">
            Нет аккаунта? Зарегистрироваться
          </NuxtLink>
        </div>
      </template>
    </UCard>
  </form>
</template>
