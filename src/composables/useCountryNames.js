/**
 * composables/useCountryNames.js
 * Proporciona nombres de países traducidos según el idioma actual
 */
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

export function useCountryNames() {
  const { t } = useI18n()

  const getCountryName = (countryId) => {
    try {
      return t(`countries.${countryId}`)
    } catch {
      return countryId
    }
  }

  return {
    getCountryName
  }
}
