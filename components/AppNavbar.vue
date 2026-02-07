<!-- components/AppNavbar.vue -->
<script setup lang="ts">
const { user, clear: logout } = useUserSession()

async function handleLogout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await logout()
  await navigateTo('/login')
}

const links = [
  { label: '📊 Dashboard', to: '/dashboard' },
  { label: '📋 Журнал', to: '/cleanings' },
  { label: '📈 Статистика', to: '/statistics' },
]
</script>

<template>
  <nav class="bg-white border-b border-stone-200">
    <div class="container mx-auto px-4 flex items-center justify-between h-14">
      <div class="flex items-center gap-6">
        <NuxtLink to="/dashboard" class="font-bold text-lg">
          ☕ CoffeeClean
        </NuxtLink>
        <div class="flex gap-4">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="text-sm text-stone-600 hover:text-stone-900"
            active-class="text-stone-900 font-semibold"
          >
            {{ link.label }}
          </NuxtLink>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <span class="text-sm text-stone-500">{{ user?.name }}</span>
        <UButton size="xs" variant="soft" @click="handleLogout">
          Выйти
        </UButton>
      </div>
    </div>
  </nav>
</template>
