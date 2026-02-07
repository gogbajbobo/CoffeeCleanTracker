// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: ['@nuxt/ui', 'nuxt-auth-utils'],

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    authSecret: process.env.NUXT_AUTH_SECRET,
    bcryptRounds: 12,

    public: {
      appName: 'CoffeeClean Tracker',
      machineName: 'Bosch VeroCafe TES50328RW/12',
    },
  },

  typescript: {
    strict: true,
  },

  telemetry: false,
})
