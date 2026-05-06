/**
 * boot/firebase.js
 * Inicializa Firebase y configura onAuthStateChanged
 * para persistir la sesión del usuario.
 */
import { isMissingConfig } from 'src/firebase/config'

export default async function ({ app }) {
  // Inicializar tema del usuario
  const { useThemePreference } = await import('src/composables/useThemePreference')
  const { initializeTheme } = useThemePreference()
  initializeTheme()

  if (isMissingConfig) {
    // Sin Firebase: solo recuperar usuario del localStorage en modo local
    const { useAuthStore } = await import('src/stores/authStore')
    const authStore = useAuthStore()
    authStore.initializeFromStorage()
    return
  }

  // Con Firebase: configurar onAuthStateChanged
  try {
    const { onAuthStateChanged } = await import('firebase/auth')
    const { auth } = await import('src/firebase/config')
    const { useAuthStore } = await import('src/stores/authStore')
    
    if (!auth) return
    
    const authStore = useAuthStore()
    
    // Primero, recuperar del localStorage (por si estaba logueado antes)
    authStore.initializeFromStorage()
    
    // Luego, escuchar cambios en Firebase Auth
    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        authStore.setUser(firebaseUser)
      } else {
        // Si Firebase dice que no hay usuario, limpiar
        authStore.setUser(null)
      }
    })
  } catch (e) {
    console.warn('Firebase boot error:', e)
  }
}