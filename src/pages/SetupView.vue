<template>
  <q-page class="setup-page flex flex-center">
    <q-card class="setup-card q-pa-lg" flat dark>
      <q-card-section class="text-center">
        <q-icon name="sports_soccer" color="yellow-6" size="64px" />
        <div class="text-h5 text-white q-mt-sm">Álbum Mundial 2026</div>
        <div class="text-caption text-grey-5">Ingresá tu nombre para comenzar</div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="name"
          dark
          outlined
          label="Tu nombre"
          color="yellow-6"
          :rules="[val => !!val || 'El nombre es requerido']"
          @keydown.enter="onStart"
        />
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          label="Comenzar"
          color="yellow-8"
          text-color="black"
          unelevated
          rounded
          size="lg"
          :disable="!name.trim()"
          @click="onStart"
          class="full-width"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from 'src/stores/userStore.js'

const name   = ref('')
const router = useRouter()
const store  = useUserStore()

function onStart () {
  if (!name.value.trim()) return
  store.setUser(name.value.trim())
  router.push({ name: 'album' })
}
</script>

<style scoped lang="scss">
.setup-page {
  background: linear-gradient(135deg, #0a0a2e 0%, #1a237e 100%);
  min-height: 100vh;
}

.setup-card {
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.08) !important;
  border-radius: 16px;
}
</style>
