<!-- layouts/auth.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-stone-100">
    <div class="w-full max-w-md p-8">
      <h1 class="text-2xl font-bold text-center mb-2">☕ CoffeeClean</h1>
      <p class="text-center text-stone-500 mb-8">
        {{ $config.public.machineName }}
      </p>
      <slot />
    </div>
  </div>
</template>
