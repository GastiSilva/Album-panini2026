/**
 * boot/i18n.js
 * Inicializa vue-i18n con los idiomas disponibles
 */
import { createI18n } from 'vue-i18n'
import es from 'src/i18n/es.json'
import en from 'src/i18n/en.json'
import pt from 'src/i18n/pt.json'

const LANGUAGE_KEY = 'album2026_language'

export default async function ({ app }) {
  // Obtener idioma guardado o detectar del navegador
  let locale = getInitialLanguage()

  const i18n = createI18n({
    legacy: false, // Usar Composition API
    locale,
    fallbackLocale: 'es',
    messages: {
      es,
      en,
      pt
    }
  })

  app.use(i18n)
}

// Detectar idioma inicial
function getInitialLanguage() {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY)
    if (saved) return saved

    // Detectar del navegador
    const browserLang = navigator.language.split('-')[0]
    if (['es', 'en', 'pt'].includes(browserLang)) {
      return browserLang
    }
  } catch {}

  return 'es' // Por defecto español
}

// Función para cambiar idioma y guardar
export function setLanguage(locale) {
  try {
    localStorage.setItem(LANGUAGE_KEY, locale)
  } catch {}
}
