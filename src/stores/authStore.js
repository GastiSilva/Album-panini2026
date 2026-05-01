/**
 * stores/authStore.js
 * Pinia store de autenticación con lazy imports de Firebase.
 * Funciona en modo local (sin .env.local) para poder usar el álbum.
 * Persiste la sesión en localStorage.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Notify } from 'quasar'
import { isMissingConfig } from 'src/firebase/config'

const LS_USER_KEY = 'album2026_user'

export const useAuthStore = defineStore('auth', () => {
  const user      = ref(null)
  const loading   = ref(false)

  const userName  = computed(() => user.value?.displayName || user.value?.email || 'Anónimo')
  const userPhoto = computed(() => user.value?.photoURL || null)
  const userId    = computed(() => user.value?.uid || null)

  function setUser(firebaseUser) {
    user.value = firebaseUser
    if (firebaseUser) {
      // Guardar en localStorage (modo local e Firebase)
      try {
        localStorage.setItem(LS_USER_KEY, JSON.stringify(firebaseUser))
      } catch {}
    } else {
      // Limpiar localStorage al logout
      try {
        localStorage.removeItem(LS_USER_KEY)
      } catch {}
    }
  }

  // Recuperar usuario del localStorage al iniciar
  function initializeFromStorage() {
    try {
      const stored = localStorage.getItem(LS_USER_KEY)
      if (stored) {
        user.value = JSON.parse(stored)
      }
    } catch {}
  }

  async function loginWithGoogle() {
    if (isMissingConfig) {
      Notify.create({ type: 'warning', message: 'Configura Firebase en .env.local primero' })
      return
    }
    loading.value = true
    try {
      const { signInWithPopup } = await import('firebase/auth')
      const { auth, googleProvider } = await import('src/firebase/config')
      const result = await signInWithPopup(auth, googleProvider)
      user.value = result.user
      await _ensureUserDoc(result.user)
      Notify.create({ type: 'positive', message: `¡Bienvenido, ${result.user.displayName}!` })
    } catch (e) {
      Notify.create({ type: 'negative', message: 'Error al iniciar sesión con Google' })
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function loginAnonymous(displayName) {
    if (isMissingConfig) {
      // Sin Firebase: login local para usar el álbum de forma offline
      user.value = { uid: 'local-' + Date.now(), displayName, photoURL: null, email: null, isLocal: true }
      Notify.create({ type: 'positive', message: `¡Bienvenido, ${displayName}! (modo local)` })
      return
    }
    loading.value = true
    try {
      const { signInAnonymously, updateProfile } = await import('firebase/auth')
      const { auth } = await import('src/firebase/config')
      const result = await signInAnonymously(auth)
      await updateProfile(result.user, { displayName })
      user.value = { ...result.user, displayName }
      await _ensureUserDoc({ ...result.user, displayName })
      Notify.create({ type: 'positive', message: `¡Bienvenido, ${displayName}!` })
    } catch (e) {
      Notify.create({ type: 'negative', message: 'Error al iniciar sesión' })
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    if (!isMissingConfig) {
      const { signOut } = await import('firebase/auth')
      const { auth }    = await import('src/firebase/config')
      await signOut(auth).catch(console.warn)
    }
    user.value = null
  }

  async function _ensureUserDoc(firebaseUser) {
    try {
      const { doc, setDoc, getDoc, serverTimestamp } = await import('firebase/firestore')
      const { db } = await import('src/firebase/config')
      if (!db) return
      const docRef = doc(db, 'users', firebaseUser.uid)
      const snap   = await getDoc(docRef)
      if (!snap.exists()) {
        await setDoc(docRef, {
          displayName: firebaseUser.displayName || 'Sin nombre',
          photoURL:    firebaseUser.photoURL    || null,
          email:       firebaseUser.email       || null,
          createdAt:   serverTimestamp(),
        })
      }
    } catch (e) {
      console.warn('_ensureUserDoc error:', e)
    }
  }

  return { user, loading, userName, userPhoto, userId, setUser, initializeFromStorage, loginWithGoogle, loginAnonymous, logout }
})
