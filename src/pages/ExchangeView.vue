<template>
  <q-page class="exchange-page q-pa-md">

    <div class="text-h5 text-white q-mb-md">
      🔄 Intercambios
    </div>

    <!-- Load friends button -->
    <div v-if="!friendsLoaded" class="text-center q-mt-xl">
      <q-btn
        color="primary"
        label="Ver amigos y figuritas disponibles"
        icon="people"
        @click="onLoadFriends"
        :loading="loadingFriends"
        unelevated
        rounded
        size="lg"
      />
    </div>

    <!-- My repeated stickers summary -->
    <q-card v-if="friendsLoaded" dark flat bordered class="q-mb-lg bg-dark-card">
      <q-card-section>
        <div class="text-subtitle1 text-yellow-6">
          ⭐ Mis figuritas repetidas ({{ myRepetidas.length }})
        </div>
      </q-card-section>
      <q-card-section v-if="myRepetidas.length === 0">
        <p class="text-grey-5">No tenés figuritas repetidas todavía.</p>
      </q-card-section>
      <q-card-section v-else>
        <div class="chip-grid">
          <q-chip
            v-for="id in myRepetidas"
            :key="id"
            dense
            color="orange-8"
            text-color="white"
            icon="star"
          >
            {{ id }}
          </q-chip>
        </div>
      </q-card-section>
    </q-card>

    <!-- Friends list -->
    <template v-if="friendsLoaded">
      <div v-if="friends.length === 0" class="text-grey-5 text-center q-mt-xl">
        No hay otros usuarios en la app todavía.
      </div>

      <q-card
        v-for="friend in friends"
        :key="friend.id"
        dark
        flat
        bordered
        class="q-mb-md bg-dark-card"
      >
        <q-card-section class="row items-center q-pb-none">
          <q-avatar color="primary" text-color="white" size="36px">
            {{ friend.displayName.charAt(0).toUpperCase() }}
          </q-avatar>
          <span class="text-white text-subtitle1 q-ml-sm">{{ friend.displayName }}</span>
          <q-space />
          <q-chip dense color="green-8" text-color="white">
            {{ friendTengoCount(friend) }} tienen
          </q-chip>
        </q-card-section>

        <q-card-section>
          <div class="text-caption text-yellow-6 q-mb-xs">
            🔄 Puedo darle ({{ matchForFriend(friend).length }}):
          </div>
          <div v-if="matchForFriend(friend).length === 0" class="text-grey-6 text-caption">
            No hay coincidencias.
          </div>
          <div v-else class="chip-grid">
            <q-chip
              v-for="id in matchForFriend(friend)"
              :key="id"
              dense
              color="teal-8"
              text-color="white"
              icon="swap_horiz"
            >
              {{ id }}
            </q-chip>
          </div>
        </q-card-section>
      </q-card>
    </template>

  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFirebaseAlbum, STATE_TENGO } from 'src/composables/useFirebaseAlbum.js'

const { friends, loadFriends, getMyRepetidas, getMatchForFriend } = useFirebaseAlbum()

const friendsLoaded   = ref(false)
const loadingFriends  = ref(false)

const myRepetidas = computed(() => getMyRepetidas())

async function onLoadFriends () {
  loadingFriends.value = true
  await loadFriends()
  loadingFriends.value = false
  friendsLoaded.value  = true
}

function friendTengoCount (friend) {
  return Object.values(friend.stickers).filter(v => v >= STATE_TENGO).length
}

function matchForFriend (friend) {
  return getMatchForFriend(friend)
}
</script>

<style scoped lang="scss">
.exchange-page {
  background-color: #0a0a2e;
  min-height: 100vh;
}

.bg-dark-card {
  background: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  border-radius: 10px;
}

.chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
