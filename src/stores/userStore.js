import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userId      = ref(localStorage.getItem('album_userId') || '')
  const displayName = ref(localStorage.getItem('album_displayName') || '')

  function setUser (name) {
    // Use a URL-safe slug as the Firestore document ID
    const slug = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    // Fallback to a timestamp-based ID if the name produces an empty slug (e.g. all emojis/special chars)
    userId.value      = slug || `user_${Date.now()}`
    displayName.value = name

    localStorage.setItem('album_userId',      userId.value)
    localStorage.setItem('album_displayName', displayName.value)
  }

  function clearUser () {
    userId.value      = ''
    displayName.value = ''
    localStorage.removeItem('album_userId')
    localStorage.removeItem('album_displayName')
  }

  const isSetup = () => !!userId.value

  return { userId, displayName, setUser, clearUser, isSetup }
})
