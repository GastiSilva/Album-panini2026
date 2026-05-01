<template>
  <q-page class="login-page flex flex-center">
    <q-card class="login-card q-pa-lg shadow-10">
      <!-- Logo / Título -->
      <div class="text-center q-mb-lg">
        <div class="text-h3 q-mb-xs">⚽</div>
        <div class="text-h5 text-weight-bold text-primary">Álbum Mundial 2026</div>
        <div class="text-caption text-grey q-mt-xs">Controla tus figuritas con amigos</div>
      </div>

      <q-separator class="q-mb-lg" />

      <!-- Login con Google -->
      <q-btn
        unelevated
        rounded
        size="md"
        class="full-width q-mb-md"
        color="white"
        text-color="dark"
        icon="img:https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        label="Continuar con Google"
        :loading="authStore.loading"
        @click="authStore.loginWithGoogle()"
        style="border: 1px solid #e0e0e0"
      />

      <div class="row items-center q-mb-md">
        <q-separator class="col" />
        <span class="text-caption text-grey q-px-sm">o</span>
        <q-separator class="col" />
      </div>

      <!-- Login anónimo con nombre -->
      <q-form @submit.prevent="loginAnon" class="column q-gutter-sm">
        <q-input
          v-model="anonName"
          outlined
          rounded
          dense
          label="Tu nombre (sin cuenta)"
          placeholder="Ej: Matías"
          :rules="[v => !!v || 'Escribe tu nombre']"
          maxlength="30"
        >
          <template #prepend><q-icon name="person" /></template>
        </q-input>

        <q-btn
          unelevated
          rounded
          type="submit"
          color="primary"
          label="Entrar como invitado"
          :loading="authStore.loading"
          class="full-width"
          icon="login"
        />
      </q-form>

      <div class="text-caption text-grey text-center q-mt-lg">
        🔒 Tus datos se sincronizan en tiempo real con Firebase
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'
import { watch } from 'vue'

const authStore = useAuthStore()
const router    = useRouter()
const anonName  = ref('')

async function loginAnon() {
  if (!anonName.value.trim()) return
  await authStore.loginAnonymous(anonName.value.trim())
}

// Redirigir automáticamente al autenticarse
watch(() => authStore.user, (user) => {
  if (user) router.push({ name: 'album' })
})
</script>

<style lang="scss" scoped>
.login-page {
  background: linear-gradient(160deg, #0D47A1 0%, #1565C0 50%, #1976D2 100%);
  min-height: 100vh;
}

.login-card {
  width: 100%;
  max-width: 380px;
  border-radius: 20px;
}
</style>
