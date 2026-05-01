/**
 * Boot file: Firebase initialization
 * This runs before the Vue app mounts.
 */
import { boot } from 'quasar/wrappers'
import 'src/firebase/index.js'

export default boot(() => {
  // Firebase is initialized by importing src/firebase/index.js
  // The db and auth exports are available throughout the app
})
