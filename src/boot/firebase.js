/**
 * boot/firebase.js
 * Boot file de Quasar: inicializa Firebase y escucha cambios de auth.
 */
import { boot } from 'quasar/wrappers'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from 'src/firebase/config'
import { useAuthStore } from 'src/stores/authStore'

export default boot(({ router }) => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      const authStore = useAuthStore()
      authStore.setUser(user)

      // Solo redirige a login si no hay user y la ruta requiere auth
      if (!user && router.currentRoute.value.meta?.requiresAuth) {
        router.push({ name: 'login' })
      }

      resolve()
    })
  })
})
