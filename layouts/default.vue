<!-- layouts/default.vue -->
<template>
  <div class="min-h-screen bg-stone-50">
    <AppNavbar />
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
</template>
