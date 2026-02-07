// middleware/auth.global.ts

export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()

  const publicPages = ['/login', '/register']

  if (!loggedIn.value && !publicPages.includes(to.path)) {
    return navigateTo('/login')
  }

  // Если уже залогинен — не пускаем на login/register
  if (loggedIn.value && publicPages.includes(to.path)) {
    return navigateTo('/dashboard')
  }
})
