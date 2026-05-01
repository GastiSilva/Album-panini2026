/**
 * stores/authStore.js
 * Pinia store para el estado de autenticación.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  signInWithPopup,
  signInAnonymously,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from 'src/firebase/config'
import { Notify } from 'quasar'

export const useAuthStore = defineStore('auth', () => {
  const user      = ref(null)
  const loading   = ref(false)
  const userName  = computed(() => user.value?.displayName || user.value?.email || 'Anónimo')
  const userPhoto = computed(() => user.value?.photoURL || null)
  const userId    = computed(() => user.value?.uid || null)

  function setUser(firebaseUser) {
    user.value = firebaseUser
  }

  async function loginWithGoogle() {
    loading.value = true
    try {
      const result = await signInWithPopup(auth, googleProvider)
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
    loading.value = true
    try {
      const result = await signInAnonymously(auth)
      await updateProfile(result.user, { displayName })
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
    await signOut(auth)
    user.value = null
  }

  async function _ensureUserDoc(firebaseUser) {
    const ref = doc(db, 'users', firebaseUser.uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      await setDoc(ref, {
        displayName: firebaseUser.displayName || 'Sin nombre',
        photoURL:    firebaseUser.photoURL || null,
        email:       firebaseUser.email || null,
        createdAt:   serverTimestamp(),
        // owned: {}  ← se crea vacío al primer update
      })
    }
  }

  return { user, loading, userName, userPhoto, userId, setUser, loginWithGoogle, loginAnonymous, logout }
})
