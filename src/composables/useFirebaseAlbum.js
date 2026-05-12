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
    if (!authStore.userId || authStore.user?.isLocal) { _loadFromLS(); return }

    loading.value = true

    Promise.all([
      import('firebase/firestore'),
      import('src/firebase/config'),
    ]).then(async ([{ doc, onSnapshot, setDoc, serverTimestamp, getDoc }, { db }]) => {
      if (!db) { _loadFromLS(); loading.value = false; return }

      const docRef = doc(db, 'users', authStore.userId)

      // Garantizar que el documento existe ANTES de suscribirse
      // Así el primer write siempre es un update, nunca falla con 'no document'
      const snap0 = await getDoc(docRef).catch(() => null)
      if (!snap0 || !snap0.exists()) {
        await setDoc(docRef, {
          displayName: authStore.user?.displayName || authStore.user?.email || 'Usuario',
          email:       authStore.user?.email || null,
          photoURL:    authStore.user?.photoURL || null,
          owned:       {},
          createdAt:   serverTimestamp(),
        }, { merge: true }).catch(console.warn)
      }

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

    subscribeToExchanges()
  }

  function unsubscribeFromAlbum() {
    _unsubFirestore?.()
    _unsubFirestore = null
    _unsubExchangesIn?.()
    _unsubExchangesIn = null
    _unsubExchangesOut?.()
    _unsubExchangesOut = null
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
    const authStoreCheck = useAuthStore()
    if (isMissingConfig || authStoreCheck.user?.isLocal) {
      _saveToLS()
      return
    }

    _pendingWrites.set(key, { newCount, prevVal })
    clearTimeout(_flushTimer)
    _flushTimer = setTimeout(() => _flushToFirestore(), 400)
  }

  async function _flushToFirestore() {
    if (_pendingWrites.size === 0) return

    const authStore = useAuthStore()
    if (!authStore.userId || authStore.user?.isLocal) {
      // Si no hay usuario válido, guardar en localStorage como fallback
      _saveToLS()
      _pendingWrites.clear()
      return
    }

    syncing.value = true

    const snapshot = new Map(_pendingWrites)
    _pendingWrites.clear()

  try {
      const [{ doc, setDoc, deleteField, serverTimestamp }, { db }] =
        await Promise.all([import('firebase/firestore'), import('src/firebase/config')])

      if (!db) { syncing.value = false; return }

      const authStore = useAuthStore()
      
      // Armamos el objeto anidado correctamente para setDoc
      const ownedUpdates = {}
      for (const [key, { newCount }] of snapshot) {
        ownedUpdates[key] = newCount <= 0 ? deleteField() : newCount
      }

      // Mandamos a guardar con la estructura real
      await setDoc(doc(db, 'users', authStore.userId), {
        updatedAt: serverTimestamp(),
        owned: ownedUpdates
      }, { merge: true })
      
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
        // Retornamos el primer documento que coincida (incluimos el uid)
        const docSnap = querySnapshot.docs[0]
        return { uid: docSnap.id, ...docSnap.data() }
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

  // ── Exchanges / Propuestas ────────────────────────────────────────────────
  const pendingProposals = ref([])  // propuestas entrantes (pendientes)
  const sentProposals    = ref([])  // propuestas enviadas por mí

  const unreadCount = computed(() =>
    pendingProposals.value.filter(p => !p.readByReceiver).length
  )

  let _unsubExchangesIn  = null
  let _unsubExchangesOut = null

  function subscribeToExchanges() {
    if (isMissingConfig) return
    const authStore = useAuthStore()
    if (!authStore.userId || authStore.user?.isLocal) return

    Promise.all([
      import('firebase/firestore'),
      import('src/firebase/config'),
    ]).then(([{ collection, query, where, onSnapshot }, { db }]) => {
      if (!db) return

      // Propuestas entrantes (yo soy el destinatario)
      const qIn = query(collection(db, 'exchanges'), where('toUid', '==', authStore.userId))
      _unsubExchangesIn = onSnapshot(qIn, (snap) => {
        pendingProposals.value = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(p => p.status === 'pending')
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      })

      // Propuestas enviadas (yo soy el remitente)
      const qOut = query(collection(db, 'exchanges'), where('fromUid', '==', authStore.userId))
      _unsubExchangesOut = onSnapshot(qOut, (snap) => {
        sentProposals.value = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      })
    }).catch(err => console.error('subscribeToExchanges error:', err))
  }

  async function sendExchangeProposal({ toUid, toAlias, senderGives, receiverGives }) {
    if (isMissingConfig) return
    const [{ collection, addDoc, serverTimestamp }, { db }] =
      await Promise.all([import('firebase/firestore'), import('src/firebase/config')])
    if (!db) return

    const authStore = useAuthStore()
    await addDoc(collection(db, 'exchanges'), {
      fromUid:         authStore.userId,
      fromAlias:       alias.value || authStore.userName,
      fromDisplayName: authStore.userName,
      fromPhoto:       authStore.userPhoto || null,
      toUid,
      toAlias,
      senderGives,    // IDs de figuritas que YO doy
      receiverGives,  // IDs de figuritas que el AMIGO da
      status:          'pending',
      readByReceiver:  false,
      createdAt:       serverTimestamp(),
      updatedAt:       serverTimestamp(),
    })
  }

  async function respondToProposal(exchangeId, accept) {
    const [{ doc, updateDoc, serverTimestamp }, { db }] =
      await Promise.all([import('firebase/firestore'), import('src/firebase/config')])
    if (!db) return
    await updateDoc(doc(db, 'exchanges', exchangeId), {
      status:         accept ? 'accepted' : 'rejected',
      readByReceiver: true,
      updatedAt:      serverTimestamp(),
    })
  }

  async function markProposalRead(exchangeId) {
    if (isMissingConfig) return
    const [{ doc, updateDoc }, { db }] =
      await Promise.all([import('firebase/firestore'), import('src/firebase/config')])
    if (!db) return
    await updateDoc(doc(db, 'exchanges', exchangeId), { readByReceiver: true })
  }

  async function cancelProposal(exchangeId) {
    const [{ doc, updateDoc, serverTimestamp }, { db }] =
      await Promise.all([import('firebase/firestore'), import('src/firebase/config')])
    if (!db) return
    await updateDoc(doc(db, 'exchanges', exchangeId), {
      status:    'cancelled',
      updatedAt: serverTimestamp(),
    })
  }

  _instance = {
    owned:    readonly(owned),
    alias:    readonly(alias),
    loading:  readonly(loading),
    syncing:  readonly(syncing),
    error:    readonly(error),
    stats,
    pendingProposals: readonly(pendingProposals),
    sentProposals:    readonly(sentProposals),
    unreadCount,
    getCount,
    subscribeToAlbum,
    unsubscribeFromAlbum,
    updateSticker,
    getFriendAlbumByAlias,
    getExchangeCandidates,
    saveUserAlias,
    sendExchangeProposal,
    respondToProposal,
    markProposalRead,
    cancelProposal,
  }

  return _instance
}
