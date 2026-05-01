import { createApp } from 'vue'
import { Quasar, Notify, Dialog, Loading, LocalStorage } from 'quasar'
import { createPinia } from 'pinia'
import quasarLang from 'quasar/lang/es'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'
import 'quasar/src/css/index.sass'
import './css/app.scss'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(Quasar, {
  plugins: { Notify, Dialog, Loading, LocalStorage },
  lang: quasarLang,
  config: {
    dark: 'auto',
    brand: {
      primary: '#1565C0',
      secondary: '#E53935',
      accent: '#FFD600',
      dark: '#1a1a2e',
    },
  },
})

app.use(pinia)
app.use(router)
app.mount('#q-app')
