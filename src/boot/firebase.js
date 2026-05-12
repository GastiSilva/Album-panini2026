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
    
    // Primero, recuperar del localStorage para UI inmediata
    authStore.initializeFromStorage()
    
    // onAuthStateChanged puede disparar null primero mientras Firebase carga
    // la sesión desde IndexedDB. Usamos un flag para ignorar ese null inicial
    // y no borrar el usuario restaurado del localStorage.
    let firebaseAuthResolved = false

    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Usuario real: siempre actualizar
        authStore.setUser(firebaseUser)
        firebaseAuthResolved = true
      } else {
        if (!firebaseAuthResolved) {
          // Primer null: Firebase todavía está cargando desde IndexedDB.
          // No borrar el usuario del localStorage — dejar que Firebase termine.
          firebaseAuthResolved = true
        } else {
          // Null posterior al primer resolve: el usuario realmente cerró sesión
          authStore.setUser(null)
        }
      }
    })
  } catch (e) {
    console.warn('Firebase boot error:', e)
  }
}