/**
 * composables/useLanguage.js
 * Composable para manejar el idioma y las preferencias del usuario
 */
import { useI18n } from 'vue-i18n'
import { ref, computed } from 'vue'
import { setLanguage } from 'src/boot/i18n'

export function useLanguage() {
  const { locale, t } = useI18n()

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' }
  ]

  const currentLanguage = computed(() => {
    return languages.find(l => l.code === locale.value)
  })

  function changeLanguage(code) {
    locale.value = code
    setLanguage(code)
  }

  return {
    locale,
    t,
    languages,
    currentLanguage,
    changeLanguage
  }
}
