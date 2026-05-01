import { store } from 'quasar/wrappers'
import { createPinia } from 'pinia'

/*
 * Si necesitas usar SSR, cambia las funciones `useStore` a `useStore(pinia)`.
 * Esto es necesario porque Quasar con SSR crea múltiples instancias Pinia.
 */
export default store(function (/* { ssrContext } */) {
  const pinia = createPinia()
  return pinia
})
