<template>
  <div class="login-page flex flex-center">
    <q-card class="login-card q-pa-md shadow-10">
      <!-- Logo / Título -->
      <div class="text-center q-mb-lg">
        <div class="q-mb-md">
          <img 
            src="../assets/trionda.png" 
            style="width: 120px; height: auto;" 
          />
        </div>
        <div class="text-h5 text-weight-bold text-primary">{{ t('common.myAlbum') }} 2026</div>
        <div class="text-caption text-grey q-mt-xs">{{ t('layout.worldCup') }}</div>
      </div>

      <q-separator class="q-mb-lg" />

      <!-- Tabs para cambiar entre Login, Registro, Recuperar Contraseña -->
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        style="margin: 0 -16px 16px -16px; width: calc(100% + 32px);"
      >
        <q-tab name="login" :label="t('login.title')" />
        <q-tab name="register" :label="t('login.register')" />
        <q-tab v-if="showResetForm" name="reset" :label="t('login.resetPassword')" />
      </q-tabs>

      <!-- TAB: LOGIN -->
      <q-tab-panels v-model="activeTab" animated>
        <q-tab-panel name="login">
          <!-- Google Login -->
          <q-btn
            unelevated
            rounded
            size="md"
            class="full-width q-mb-md"
            color="white"
            text-color="dark"
            icon="img:https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            :label="t('login.loginGoogle')"
            :loading="authStore.loading"
            @click="authStore.loginWithGoogle()"
            style="border: 1px solid #e0e0e0"
          />

          <div class="row items-center q-mb-md">
            <q-separator class="col" />
            <span class="text-caption text-grey q-px-sm">o</span>
            <q-separator class="col" />
          </div>

          <!-- Email/Password Login -->
          <q-form @submit.prevent="handleEmailLogin" class="column q-gutter-sm">
            <q-input
              v-model="emailLogin"
              outlined
              rounded
              dense
              type="email"
              :label="t('login.email')"
              :placeholder="t('login.email')"
              :rules="[v => !!v || t('login.invalidEmail'), v => isValidEmail(v) || t('login.invalidEmail')]"
            >
              <template #prepend><q-icon name="email" /></template>
            </q-input>

            <q-input
              v-model="passwordLogin"
              outlined
              rounded
              dense
              :type="showPassword ? 'text' : 'password'"
              :label="t('login.password')"
              :placeholder="t('login.password')"
              :rules="[v => !!v || t('login.password')]"
            >
              <template #prepend><q-icon name="lock" /></template>
              <template #append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <div class="text-right">
              <span class="text-caption text-primary cursor-pointer" @click="showResetForm = true; activeTab = 'reset'">
                {{ t('login.forgotPassword') }}?
              </span>
            </div>

            <!-- Botón de login -->
            <q-btn
              unelevated
              rounded
              type="submit"
              color="primary"
              :label="t('login.loginEmail')"
              :loading="authStore.loading"
              class="full-width"
              icon="login"
            />
          </q-form>

          <div class="row items-center q-mt-md">
            <q-separator class="col" />
            <span class="text-caption text-grey q-px-sm">o</span>
            <q-separator class="col" />
          </div>

          <!-- Guest Login -->
          <q-form @submit.prevent="loginAnon" class="column q-gutter-sm q-mt-md">
            <q-input
              v-model="anonName"
              outlined
              rounded
              dense
              :label="t('login.guestName')"
              :placeholder="t('login.guestNamePlaceholder')"
              :rules="[v => !!v || t('login.enterYourName')]"
              maxlength="30"
            >
              <template #prepend><q-icon name="person" /></template>
            </q-input>

            <q-btn
              unelevated
              rounded
              type="submit"
              color="positive"
              outline
              :label="t('login.loginAsGuest')"
              :loading="authStore.loading"
              class="full-width"
              icon="person"
            />
          </q-form>
        </q-tab-panel>

        <!-- TAB: REGISTER -->
        <q-tab-panel name="register">
          <q-form @submit.prevent="handleRegister" class="column q-gutter-sm">
            <q-input
              v-model="emailRegister"
              outlined
              rounded
              dense
              type="email"
              :label="t('login.email')"
              :placeholder="t('login.email')"
              :rules="[v => !!v || t('login.invalidEmail'), v => isValidEmail(v) || t('login.invalidEmail')]"
            >
              <template #prepend><q-icon name="email" /></template>
            </q-input>

            <q-input
              v-model="passwordRegister"
              outlined
              rounded
              dense
              :type="showPasswordReg ? 'text' : 'password'"
              :label="t('login.password')"
              :placeholder="t('login.password')"
              :rules="[
                v => !!v || t('login.password'),
                v => v.length >= 6 || t('login.passwordMinLength')
              ]"
            >
              <template #prepend><q-icon name="lock" /></template>
              <template #append>
                <q-icon
                  :name="showPasswordReg ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPasswordReg = !showPasswordReg"
                />
              </template>
            </q-input>

            <q-input
              v-model="passwordConfirm"
              outlined
              rounded
              dense
              :type="showPasswordConf ? 'text' : 'password'"
              :label="t('login.confirmPassword')"
              :placeholder="t('login.confirmPassword')"
              :rules="[
                v => !!v || t('login.confirmPassword'),
                v => v === passwordRegister || t('login.passwordsDoNotMatch')
              ]"
            >
              <template #prepend><q-icon name="lock" /></template>
              <template #append>
                <q-icon
                  :name="showPasswordConf ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPasswordConf = !showPasswordConf"
                />
              </template>
            </q-input>

            <q-btn
              unelevated
              rounded
              type="submit"
              color="primary"
              :label="t('login.signUp')"
              :loading="authStore.loading"
              class="full-width"
              icon="app_registration"
            />

            <div class="text-caption text-grey text-center">
              {{ t('login.haveAccount') }}
              <span class="cursor-pointer text-primary" @click="activeTab = 'login'">
                {{ t('login.title') }}
              </span>
            </div>
          </q-form>
        </q-tab-panel>

        <!-- TAB: RESET PASSWORD -->
        <q-tab-panel v-if="showResetForm" name="reset">
          <q-form @submit.prevent="handleResetPassword" class="column q-gutter-sm">
            <div class="text-subtitle2 text-weight-bold q-mb-md">
              {{ t('login.resetPassword') }}
            </div>
            
            <div class="text-caption text-grey q-mb-md">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </div>

            <q-input
              v-model="emailReset"
              outlined
              rounded
              dense
              type="email"
              :label="t('login.email')"
              :placeholder="t('login.email')"
              :rules="[v => !!v || t('login.invalidEmail'), v => isValidEmail(v) || t('login.invalidEmail')]"
            >
              <template #prepend><q-icon name="email" /></template>
            </q-input>

            <q-btn
              unelevated
              rounded
              type="submit"
              color="primary"
              :label="t('login.sendReset')"
              :loading="authStore.loading"
              class="full-width"
              icon="mail"
            />

            <div class="text-caption text-grey text-center q-mt-md">
              <span class="cursor-pointer text-primary" @click="backToLogin">
                {{ t('login.backToLogin') }}
              </span>
            </div>
          </q-form>
        </q-tab-panel>
      </q-tab-panels>

      <q-separator class="q-mt-lg q-mb-md" />

      <div class="text-caption text-grey text-center">
        {{ t('login.firebaseSync') }}
      </div>
    </q-card>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'
import { useLanguage } from 'src/composables/useLanguage'
import { Notify } from 'quasar'

const authStore = useAuthStore()
const router = useRouter()
const { t } = useLanguage()

// Tab control
const activeTab = ref('login')
const showResetForm = ref(false)

// Login form
const emailLogin = ref('')
const passwordLogin = ref('')
const showPassword = ref(false)

// Register form
const emailRegister = ref('')
const passwordRegister = ref('')
const passwordConfirm = ref('')
const showPasswordReg = ref(false)
const showPasswordConf = ref(false)

// Guest login
const anonName = ref('')

// Reset form
const emailReset = ref('')

// Validar email
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Manejar login con email/contraseña
async function handleEmailLogin() {
  if (!emailLogin.value.trim() || !passwordLogin.value.trim()) return
  const success = await authStore.loginWithEmailPassword(emailLogin.value.trim(), passwordLogin.value.trim())
  if (success !== false) {
    // Limpiar campos si el login fue exitoso
    emailLogin.value = ''
    passwordLogin.value = ''
  }
}

// Manejar registro
async function handleRegister() {
  if (!emailRegister.value.trim() || !passwordRegister.value.trim()) return
  if (passwordRegister.value !== passwordConfirm.value) return
  const success = await authStore.registerWithEmail(emailRegister.value.trim(), passwordRegister.value)
  if (success) {
    emailRegister.value = ''
    passwordRegister.value = ''
    passwordConfirm.value = ''
  }
}

// Manejar recuperación de contraseña
async function handleResetPassword() {
  if (!emailReset.value.trim()) return
  const success = await authStore.sendPasswordReset(emailReset.value.trim())
  if (success) {
    emailReset.value = ''
    showResetForm.value = false
    activeTab.value = 'login'
  }
}

// Volver al login desde reset
function backToLogin() {
  showResetForm.value = false
  activeTab.value = 'login'
}

// Manejar login anónimo
async function loginAnon() {
  if (!anonName.value.trim()) return
  await authStore.loginAnonymous(anonName.value.trim())
}

// Recuperar usuario guardado al montar y redirigir si ya estaba logueado
onMounted(() => {
  authStore.initializeFromStorage()
})

// Redirigir cuando cambia authStore.user
watch(() => authStore.user, (user) => {
  if (user) router.push({ name: 'album' })
}, { immediate: true })
</script>

<style lang="scss" scoped>
.login-page {
  background: linear-gradient(160deg, #0D47A1 0%, #1565C0 50%, #1976D2 100%);
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.login-card {
  width: 100%;
  max-width: 620px;
  border-radius: 20px;
}

:deep(.q-tab) {
  font-size: 0.9rem;
  font-weight: 500;
}

:deep(.q-tab-panel) {
  padding: 24px 0;
}
</style>

