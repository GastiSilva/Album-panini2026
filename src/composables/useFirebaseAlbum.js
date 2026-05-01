/**
 * composables/useFirebaseAlbum.js
 * ─────────────────────────────────────────────────────────────────────────
 * Gestiona toda la lógica de lectura/escritura del álbum en Firestore.
 *
 * ── ESQUEMA FIRESTORE (óptimo para minimizar lecturas) ──────────────────
 *
 *   Collection: users
 *   Document:   {uid}
 *   {
 *     displayName: string,
 *     photoURL:    string | null,
 *     email:       string | null,
 *     createdAt:   Timestamp,
 *     updatedAt:   Timestamp,
 *
 *     owned: {                 ← Map<string, number>
 *       "21":  1,              //   1  = tengo (pegada)
 *       "45":  3,              //   2+ = repetidas (total: pegada + extras)
 *       "980": 2,              //   0  nunca se guarda (no existe = falta)
 *       ...                    //   Solo se almacenan las figuritas poseídas
 *     }
 *   }
 *
 * Por qué este esquema:
 *   ✔ Un único documento por usuario → 1 lectura para cargar TODO el álbum
 *   ✔ Escrituras atómicas con updateDoc + merge
 *   ✔ Sin figuritas con valor 0 → ahorra espacio y Firestore cobra por campo
 *   ✔ Fácil calcular: repetidas = owned[id] > 1
 *   ✔ Subcollección solo si owned supera ~10.000 campos (no aplica aquí)
 *
 * ── OPTIMISTIC UPDATES ──────────────────────────────────────────────────
 *   La UI se actualiza inmediatamente en local; el write a Firestore
 *   se hace en paralelo. Si falla, se revierte y se notifica al usuario.
 * ─────────────────────────────────────────────────────────────────────────
 */

import { ref, computed, readonly } from 'vue'
import {
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  deleteField,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from 'src/firebase/config'
import { useAuthStore } from 'src/stores/authStore'
import { TOTAL_STICKERS } from 'src/data/albumData'
import { Notify } from 'quasar'

// ─────────────────────────────────────────────
//  Singleton: se comparte entre componentes
// ─────────────────────────────────────────────
let _instance = null

export function useFirebaseAlbum() {
  if (_instance) return _instance

  const authStore = useAuthStore()

  // ── Estado reactivo ──────────────────────────────────────────────────
  /** Map<stickerIdString, count> — solo figuritas poseídas */
  const owned     = ref({})
  const loading   = ref(false)
  const syncing   = ref(false)
  const error     = ref(null)

  // Listener de Firestore (para cancelarlo al desmontar)
  let _unsubscribe = null

  // ── Escrituras pendientes (debounce batch) ───────────────────────────
  const _pendingWrites = new Map()  // stickerIdStr → newCount
  let   _flushTimer    = null

  // ── Helpers ──────────────────────────────────────────────────────────
  const userDocRef = computed(() =>
    authStore.userId ? doc(db, 'users', authStore.userId) : null
  )

  /** Devuelve el conteo de una figurita (0 = falta) */
  function getCount(stickerId) {
    return owned.value[String(stickerId)] ?? 0
  }

  // ── Estadísticas ─────────────────────────────────────────────────────
  const stats = computed(() => {
    const entries = Object.entries(owned.value)
    const ownedCount    = entries.length                          // figuritas con count >= 1
    const repeatedCount = entries.filter(([, v]) => v > 1).length
    const missingCount  = TOTAL_STICKERS - ownedCount
    const percent       = Math.round((ownedCount / TOTAL_STICKERS) * 100)
    const totalDupes    = entries.reduce((acc, [, v]) => acc + Math.max(0, v - 1), 0)

    return { ownedCount, repeatedCount, missingCount, percent, totalDupes, total: TOTAL_STICKERS }
  })

  // ── Suscripción en tiempo real ────────────────────────────────────────
  function subscribeToAlbum() {
    if (!userDocRef.value) return
    loading.value = true

    _unsubscribe = onSnapshot(
      userDocRef.value,
      (snap) => {
        if (snap.exists()) {
          owned.value = snap.data().owned ?? {}
        } else {
          owned.value = {}
        }
        loading.value = false
        error.value   = null
      },
      (err) => {
        console.error('[useFirebaseAlbum] onSnapshot error:', err)
        error.value   = err.message
        loading.value = false
        Notify.create({ type: 'warning', message: 'Sin conexión – modo offline activo', icon: 'wifi_off' })
      }
    )
  }

  function unsubscribeFromAlbum() {
    _unsubscribe?.()
    _unsubscribe = null
    _instance    = null
  }

  // ── Actualización de una figurita (con optimistic update) ─────────────
  async function updateSticker({ stickerId, newCount }) {
    if (!userDocRef.value) return

    const key     = String(stickerId)
    const prevVal = owned.value[key] ?? 0

    // 1. Actualización optimista local instantánea
    if (newCount <= 0) {
      const next = { ...owned.value }
      delete next[key]
      owned.value = next
    } else {
      owned.value = { ...owned.value, [key]: newCount }
    }

    // 2. Acumular en batch con debounce (300 ms)
    _pendingWrites.set(key, { newCount, prevVal })
    clearTimeout(_flushTimer)
    _flushTimer = setTimeout(() => _flushToFirestore(), 300)
  }

  /** Envía todos los cambios acumulados en una sola escritura */
  async function _flushToFirestore() {
    if (_pendingWrites.size === 0 || !userDocRef.value) return

    syncing.value = true
    const updates  = {}
    const snapshot = new Map(_pendingWrites)
    _pendingWrites.clear()

    for (const [key, { newCount }] of snapshot) {
      updates[`owned.${key}`] = newCount <= 0 ? deleteField() : newCount
    }
    updates['updatedAt'] = serverTimestamp()

    try {
      await updateDoc(userDocRef.value, updates)
    } catch (err) {
      console.error('[useFirebaseAlbum] flush error:', err)
      // Revertir cambios fallidos
      const revert = { ...owned.value }
      for (const [key, { prevVal }] of snapshot) {
        if (prevVal <= 0) delete revert[key]
        else revert[key] = prevVal
      }
      owned.value = revert
      Notify.create({ type: 'negative', message: 'Error al guardar. Revirtiendo cambios.' })
    } finally {
      syncing.value = false
    }
  }

  // ── Leer álbum de otro usuario (lectura única, sin listener) ──────────
  async function getFriendAlbum(friendUid) {
    try {
      const snap = await getDoc(doc(db, 'users', friendUid))
      if (snap.exists()) return snap.data()
      return null
    } catch (e) {
      console.error('[useFirebaseAlbum] getFriendAlbum error:', e)
      return null
    }
  }

  /**
   * Calcula las figuritas que `friendOwned` tiene repetidas
   * y YO me faltan → candidatas para intercambio.
   */
  function getExchangeCandidates(friendOwned) {
    const candidates = []
    for (const [key, count] of Object.entries(friendOwned)) {
      if (count > 1 && getCount(Number(key)) === 0) {
        candidates.push({ stickerId: Number(key), friendHas: count - 1 })
      }
    }
    return candidates
  }

  // ── Instancia singleton ───────────────────────────────────────────────
  _instance = {
    owned:       readonly(owned),
    loading:     readonly(loading),
    syncing:     readonly(syncing),
    error:       readonly(error),
    stats,
    getCount,
    subscribeToAlbum,
    unsubscribeFromAlbum,
    updateSticker,
    getFriendAlbum,
    getExchangeCandidates,
  }

  return _instance
}
