/**
 * boot/firebase.js
 * Inicializa Firebase y configura onAuthStateChanged
 * para persistir la sesión del usuario.
 */
import { Dark } from 'quasar'
import { isMissingConfig } from 'src/firebase/config'

const THEME_KEY = 'album2026_theme'

export default async function ({ app }) {
  // Inicializar tema desde localStorage directamente
  try {
    const savedTheme = localStorage.getItem(THEME_KEY)
    if (savedTheme === 'dark') {
      Dark.set(true)
    } else if (savedTheme === 'light') {
      Dark.set(false)
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      Dark.set(prefersDark)
      localStorage.setItem(THEME_KEY, prefersDark ? 'dark' : 'light')
    }
  } catch (e) {
    console.warn('Error al restaurar tema:', e)
  }

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