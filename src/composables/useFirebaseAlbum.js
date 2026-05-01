/**
 * useFirebaseAlbum.js
 *
 * Composable that handles all Firestore logic for the sticker album.
 *
 * Firestore Schema (optimized to minimize reads/writes):
 *
 * Collection: users
 * Document:   {userId}
 * Fields:
 *   - displayName: string
 *   - photoURL:    string (optional)
 *   - updatedAt:   timestamp
 *   - stickers:    { [stickerId: string]: number }
 *       - Key not present → 0 (falta / missing)
 *       - Value = 1        → tengo (have/pasted)
 *       - Value ≥ 2        → repetida ×(value-1) (repeated)
 *
 * Only stickers with state > 0 are persisted, keeping the document small.
 * A single document read loads ALL sticker states at once (no per-sticker reads).
 * Updates use Firestore's updateDoc with dot-notation to write only changed fields.
 */

import { ref, computed } from 'vue'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  collection,
  getDocs
} from 'firebase/firestore'
import { db } from 'src/firebase/index.js'

// ─── Sticker state constants ─────────────────────────────────────────────────
export const STATE_FALTA    = 0  // default, not stored
export const STATE_TENGO    = 1  // have / pasted
export const STATE_REPETIDA = 2  // repeated (2 = ×1, 3 = ×2, …)

/** Maximum total state value for repeated stickers (STATE_REPETIDA + 8 = repetida×9) */
const MAX_STICKER_STATE = STATE_REPETIDA + 8

// ─── Module-level cache so multiple component instances share the same state ──
const _stickers     = ref({})   // { [stickerId]: number }
const _userId       = ref(null)
const _displayName  = ref('')
const _loading      = ref(false)
const _saving       = ref(false)
const _unsubscribe  = ref(null)
const _friends      = ref([])   // [{ id, displayName, stickers }]

export function useFirebaseAlbum () {
  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalTengo = computed(() =>
    Object.values(_stickers.value).filter(v => v === STATE_TENGO).length
  )
  const totalRepetidas = computed(() =>
    Object.values(_stickers.value).filter(v => v >= STATE_REPETIDA).length
  )

  // ── Helpers ────────────────────────────────────────────────────────────────
  function getStickerState (stickerId) {
    return _stickers.value[String(stickerId)] ?? STATE_FALTA
  }

  /**
   * Cycle sticker state:
   *   falta (0) → tengo (1) → repetida×1 (2) → ×2 (3) → ×3 (4) → … → falta (0)
   * Max repetitions capped at 9 for UX.
   */
  function nextState (current) {
    if (current === STATE_FALTA) return STATE_TENGO
    if (current >= STATE_REPETIDA && current < MAX_STICKER_STATE) return current + 1
    return STATE_FALTA // wrap back
  }

  // ── Firebase operations ───────────────────────────────────────────────────

  /**
   * Initialize: load user document and subscribe to real-time updates.
   * @param {string} userId  - Firestore document ID (e.g. Google UID or custom name)
   * @param {string} displayName - Human-readable name
   */
  async function initUser (userId, displayName = '') {
    _userId.value      = userId
    _displayName.value = displayName
    _loading.value     = true

    const userRef = doc(db, 'users', userId)

    // Ensure the document exists
    const snap = await getDoc(userRef)
    if (!snap.exists()) {
      await setDoc(userRef, {
        displayName,
        stickers: {},
        updatedAt: serverTimestamp()
      })
    } else if (displayName && snap.data().displayName !== displayName) {
      await updateDoc(userRef, { displayName })
    }

    // Subscribe to real-time updates
    if (_unsubscribe.value) _unsubscribe.value()
    _unsubscribe.value = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        _stickers.value = docSnap.data().stickers || {}
      }
      _loading.value = false
    })
  }

  /**
   * Update a single sticker state in Firestore.
   * Uses dot-notation update to write only the changed field.
   * @param {number|string} stickerId
   * @param {number} newState
   */
  async function updateSticker (stickerId, newState) {
    if (!_userId.value) return

    const id = String(stickerId)
    _saving.value = true

    // Optimistic local update
    if (newState === STATE_FALTA) {
      const updated = { ..._stickers.value }
      delete updated[id]
      _stickers.value = updated
    } else {
      _stickers.value = { ..._stickers.value, [id]: newState }
    }

    try {
      const userRef = doc(db, 'users', _userId.value)
      if (newState === STATE_FALTA) {
        // Firestore doesn't support deleting a map field via updateDoc directly
        // We use the FieldValue.delete() equivalent
        const { deleteField } = await import('firebase/firestore')
        await updateDoc(userRef, {
          [`stickers.${id}`]: deleteField(),
          updatedAt: serverTimestamp()
        })
      } else {
        await updateDoc(userRef, {
          [`stickers.${id}`]: newState,
          updatedAt: serverTimestamp()
        })
      }
    } catch (err) {
      console.error('Error updating sticker:', err)
    } finally {
      _saving.value = false
    }
  }

  /**
   * Cycle sticker to next state and persist.
   * @param {number|string} stickerId
   */
  async function cycleSticker (stickerId) {
    const current = getStickerState(stickerId)
    const next    = nextState(current)
    await updateSticker(stickerId, next)
  }

  /**
   * Load all friend documents for the "Intercambios" view.
   * Reads once (no real-time subscription) to reduce costs.
   */
  async function loadFriends () {
    const usersSnap = await getDocs(collection(db, 'users'))
    _friends.value = usersSnap.docs
      .filter(d => d.id !== _userId.value)
      .map(d => ({
        id: d.id,
        displayName: d.data().displayName || d.id,
        stickers: d.data().stickers || {}
      }))
  }

  /**
   * Returns repeated sticker IDs for the current user.
   * @returns {string[]}
   */
  function getMyRepetidas () {
    return Object.entries(_stickers.value)
      .filter(([, v]) => v >= STATE_REPETIDA)
      .map(([k]) => k)
  }

  /**
   * For a given friend, find stickers they're missing that I have repeated.
   * @param {{ stickers: Object }} friend
   * @returns {string[]} sticker IDs
   */
  function getMatchForFriend (friend) {
    const myRepetidas = getMyRepetidas()
    return myRepetidas.filter(id => {
      const friendState = friend.stickers[id] ?? STATE_FALTA
      return friendState < STATE_TENGO
    })
  }

  /** Clean up Firestore listener */
  function destroy () {
    if (_unsubscribe.value) {
      _unsubscribe.value()
      _unsubscribe.value = null
    }
  }

  return {
    // State
    stickers:      _stickers,
    userId:        _userId,
    displayName:   _displayName,
    loading:       _loading,
    saving:        _saving,
    friends:       _friends,

    // Stats
    totalTengo,
    totalRepetidas,

    // Methods
    initUser,
    updateSticker,
    cycleSticker,
    getStickerState,
    loadFriends,
    getMyRepetidas,
    getMatchForFriend,
    destroy,

    // Constants
    STATE_FALTA,
    STATE_TENGO,
    STATE_REPETIDA
  }
}
