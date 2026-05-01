/**
 * useFirebaseAlbum.js
 * - Con Firebase configurado → Firestore en tiempo real
 * - Sin Firebase (.env.local vacío) → localStorage (modo offline local)
 *
 * Esquema Firestore:
 *   users/{uid} → { owned: Map<"stickerID": count> }
 *   count = 0 nunca se guarda. Solo owned[id] ≥ 1.
 */

import { ref, computed, readonly } from 'vue'
import { isMissingConfig } from 'src/firebase/config'
import { useAuthStore }    from 'src/stores/authStore'
import { TOTAL_STICKERS }  from 'src/data/albumData'

const LS_KEY = 'album2026_owned'

// â”€â”€ Singleton â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â€
let _instance = null

export function useFirebaseAlbum() {
  if (_instance) return _instance

  const owned   = ref({})
  const alias   = ref(null)
  const loading = ref(false)
  const syncing = ref(false)
  const error   = ref(null)

  let _unsubFirestore = null
  let _pendingWrites  = new Map()
  let _flushTimer     = null

  // â”€â”€ Getters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â€
  function getCount(stickerId) {
    return owned.value[String(stickerId)] ?? 0
  }

  const stats = computed(() => {
    const entries      = Object.entries(owned.value)
    const ownedCount   = entries.length
    const repeatedCount= entries.filter(([, v]) => v > 1).length
    const missingCount = TOTAL_STICKERS - ownedCount
    const percent      = Math.round((ownedCount / TOTAL_STICKERS) * 100)
    const totalDupes   = entries.reduce((acc, [, v]) => acc + Math.max(0, v - 1), 0)
    return { ownedCount, repeatedCount, missingCount, percent, totalDupes, total: TOTAL_STICKERS }
  })

  // â”€â”€ LocalStorage helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function _loadFromLS() {
    try {
      const raw = localStorage.getItem(LS_KEY)
      owned.value = raw ? JSON.parse(raw) : {}
    } catch { owned.value = {} }
  }

  function _saveToLS() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(owned.value)) } catch {}
  }

  // â”€â”€ SuscripciÃ³n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function subscribeToAlbum() {
    if (isMissingConfig) {
      _loadFromLS()
      return
    }
    const authStore = useAuthStore()
    if (!authStore.userId) { _loadFromLS(); return }

    loading.value = true

    Promise.all([
      import('firebase/firestore'),
      import('src/firebase/config'),
    ]).then(([{ doc, onSnapshot }, { db }]) => {
      if (!db) { _loadFromLS(); loading.value = false; return }

      const docRef = doc(db, 'users', authStore.userId)
      _unsubFirestore = onSnapshot(
        docRef,
        (snap) => {
          owned.value  = snap.exists() ? (snap.data().owned ?? {}) : {}
          alias.value  = snap.exists() ? (snap.data().alias ?? null) : null
          loading.value = false
          error.value   = null
        },
        (err) => {
          console.error('Firestore snapshot error:', err)
          error.value   = err.message
          loading.value = false
          _loadFromLS()
        }
      )
    }).catch(err => {
      console.error('Firebase import error:', err)
      _loadFromLS()
      loading.value = false
    })
  }

  function unsubscribeFromAlbum() {
    _unsubFirestore?.()
    _unsubFirestore = null
    _instance = null
  }

  // â”€â”€ Actualizar figurita â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function updateSticker({ stickerId, newCount }) {
    const key     = String(stickerId)
    const prevVal = owned.value[key] ?? 0

    // Optimistic update
    const next = { ...owned.value }
    if (newCount <= 0) delete next[key]
    else next[key] = newCount
    owned.value = next

    // Persistir
    if (isMissingConfig) {
      _saveToLS()
      return
    }

    _pendingWrites.set(key, { newCount, prevVal })
    clearTimeout(_flushTimer)
    _flushTimer = setTimeout(() => _flushToFirestore(), 400)
  }

  async function _flushToFirestore() {
    if (_pendingWrites.size === 0) return
    syncing.value = true

    const snapshot = new Map(_pendingWrites)
    _pendingWrites.clear()

    try {
      const [{ doc, updateDoc, deleteField, serverTimestamp }, { db }] =
        await Promise.all([import('firebase/firestore'), import('src/firebase/config')])

      if (!db) { syncing.value = false; return }

      const authStore = useAuthStore()
      const updates   = { updatedAt: serverTimestamp() }

      for (const [key, { newCount }] of snapshot) {
        updates[`owned.${key}`] = newCount <= 0 ? deleteField() : newCount
      }

      await updateDoc(doc(db, 'users', authStore.userId), updates)
    } catch (err) {
      console.error('Flush error:', err)
      // Revertir
      const reverted = { ...owned.value }
      for (const [key, { prevVal }] of snapshot) {
        if (prevVal <= 0) delete reverted[key]
        else reverted[key] = prevVal
      }
      owned.value = reverted
    } finally {
      syncing.value = false
    }
  }


async function saveUserAlias(newAlias) {
    if (isMissingConfig) {
      alias.value = newAlias
      return
    }
    try {
      const [{ doc, setDoc }, { db }] =
        await Promise.all([import('firebase/firestore'), import('src/firebase/config')])
      if (!db) return
      
      const authStore = useAuthStore()
      // Guardamos el alias normal y uno en minúsculas para facilitar la búsqueda
      await setDoc(doc(db, 'users', authStore.userId), {
        alias: newAlias,
        aliasLowerCase: newAlias.toLowerCase()
      }, { merge: true })
      
      alias.value = newAlias
    } catch (err) {
      console.error('Error al guardar el alias:', err)
    }
  }


  // â”€â”€ Lectura de amigo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function getFriendAlbumByAlias(friendAlias) {
    if (isMissingConfig) return null
    try {
      const [{ collection, query, where, getDocs }, { db }] =
        await Promise.all([import('firebase/firestore'), import('src/firebase/config')])
      if (!db) return null
      
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where("aliasLowerCase", "==", friendAlias.toLowerCase()))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        // Retornamos el primer documento que coincida
        const docSnap = querySnapshot.docs[0]
        return docSnap.data()
      }
      return null
    } catch (err) { 
      console.error('Error buscando amigo:', err)
      return null 
    }
  }

function getExchangeCandidates(friendOwned) {
    return Object.entries(friendOwned)
      .filter(([id, count]) => count > 1 && getCount(String(id)) === 0)
      .map(([id, count]) => ({ stickerId: String(id), friendHas: count - 1 }))
  }
  _instance = {
    owned:    readonly(owned),
    alias:    readonly(alias),
    loading:  readonly(loading),
    syncing:  readonly(syncing),
    error:    readonly(error),
    stats,
    getCount,
    subscribeToAlbum,
    unsubscribeFromAlbum,
    updateSticker,
    getFriendAlbumByAlias,
    getExchangeCandidates,
    saveUserAlias,
  }

  return _instance
}
