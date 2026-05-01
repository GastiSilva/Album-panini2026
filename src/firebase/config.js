/**
 * firebase/config.js
 * Inicialización segura — no crashea si no hay credenciales en .env.local
 */
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const apiKey     = import.meta.env.VITE_FIREBASE_API_KEY
const projectId  = import.meta.env.VITE_FIREBASE_PROJECT_ID
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN

export const isMissingConfig = !apiKey || !projectId || apiKey === 'tu_api_key'

let _app  = null
let _auth = null
let _db   = null

if (!isMissingConfig) {
  try {
    _app  = getApps().length ? getApps()[0] : initializeApp({
      apiKey,
      authDomain,
      projectId,
      storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId:             import.meta.env.VITE_FIREBASE_APP_ID,
    })
    _auth = getAuth(_app)
    _db   = getFirestore(_app)
  } catch (e) {
    console.error('Firebase init error:', e)
  }
}

export const app            = _app
export const auth           = _auth
export const db             = _db
export const googleProvider = new GoogleAuthProvider()
export default _app
