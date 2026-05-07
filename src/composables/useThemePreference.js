/**
 * composables/useThemePreference.js
 * Maneja la persistencia de la preferencia del tema (oscuro/claro)
 * Guarda en localStorage para recuperar al iniciar la app
 */
import { useQuasar } from 'quasar'

const THEME_KEY = 'album2026_theme'

export function useThemePreference() {
  const $q = useQuasar()

  // Inicializar el tema desde localStorage
  function initializeTheme() {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY)
      
      if (savedTheme === 'dark') {
        $q.dark.set(true)
      } else if (savedTheme === 'light') {
        $q.dark.set(false)
      } else {
        // Si no hay preferencia guardada, usar la del sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        $q.dark.set(prefersDark)
        // Guardar la preferencia del sistema para futuras cargas
        saveThemePreference()
      }
    } catch (e) {
      console.warn('Error al restaurar tema:', e)
    }
  }

  // Cambiar el tema y guardar la preferencia
  function toggleTheme() {
    $q.dark.toggle()
    saveThemePreference()
  }

  // Guardar la preferencia del tema actual
  function saveThemePreference() {
    try {
      const theme = $q.dark.isActive ? 'dark' : 'light'
      localStorage.setItem(THEME_KEY, theme)
    } catch (e) {
      console.warn('Error al guardar preferencia de tema:', e)
    }
  }

  // Obtener el estado actual del tema
  function isDarkMode() {
    return $q.dark.isActive
  }

  return {
    initializeTheme,
    toggleTheme,
    saveThemePreference,
    isDarkMode
  }
}
