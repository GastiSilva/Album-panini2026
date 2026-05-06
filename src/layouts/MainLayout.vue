<template>
  <q-layout view="lHh Lpr lFf">
    <!-- ── HEADER ─────────────────────────────────────────────────────── -->
    <q-header elevated class="layout-header">
      <q-toolbar>
        <q-btn flat dense round icon="menu" :aria-label="t('common.menu')" @click="drawer = !drawer" />

        <q-toolbar-title class="layout-header__title row items-center">
          <!-- Acá llamás a tu logo. Si le pusiste otro nombre, cambialo acá -->
          <img src="../assets/trionda.png" style="height: 28px; margin-right: 10px;" />
          
          <span class="text-weight-bold">{{ t('layout.worldCup') }}</span>
        </q-toolbar-title>

        <!-- Progreso global compacto -->
        <q-chip
          v-if="album.stats.value.ownedCount > 0"
          dense
          color="accent"
          text-color="dark"
          icon="bar_chart"
          class="q-mr-sm"
        >
          {{ album.stats.value.percent }}%
        </q-chip>

        <!-- Indicador de sync -->
        <q-spinner-dots v-if="album.syncing.value" color="white" size="20px" class="q-mr-sm" />

        <!-- Campana de notificaciones -->
        <q-btn flat round dense icon="notifications" class="q-mr-xs" @click="notifDrawer = true">
          <q-badge
            v-if="album.unreadCount.value > 0"
            color="red"
            floating
            rounded
          >{{ album.unreadCount.value }}</q-badge>
        </q-btn>

        <q-btn flat round dense :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'" @click="toggleTheme" />

        <q-btn flat round dense icon="language" class="q-ml-xs" :title="t('language')">
          <q-menu anchor="bottom right" self="top right">
            <q-list style="min-width: 140px">
              <q-item v-for="lang in languages" :key="lang.code" clickable v-close-popup @click="changeLanguage(lang.code)" :active="lang.code === currentLanguage.code">
                <q-item-section>{{ lang.flag }} {{ lang.name }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-btn flat round dense icon="account_circle" class="q-ml-xs">
          <q-menu anchor="bottom right" self="top right">
            <q-list style="min-width: 180px">
              <q-item>
                <q-item-section avatar><q-avatar><img v-if="authStore.userPhoto" :src="authStore.userPhoto" /><q-icon v-else name="person" /></q-avatar></q-item-section>
                <q-item-section>
                  <q-item-label>{{ authStore.userName }}</q-item-label>
                  <q-item-label caption>{{ t('common.myAlbum') }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="authStore.logout()">
                <q-item-section avatar><q-icon name="logout" /></q-item-section>
                <q-item-section>{{ t('common.logout') }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>

      <!-- Barra de progreso -->
      <q-linear-progress
        :value="album.stats.value.ownedCount / album.stats.value.total"
        color="accent"
        track-color="white"
        size="3px"
      />
    </q-header>

    <!-- ── DRAWER LATERAL ─────────────────────────────────────────────── -->
    <q-drawer
      v-model="drawer"
      show-if-above
      :width="240"
      :breakpoint="768"
      bordered
      class="layout-drawer"
    >
      <q-scroll-area class="fit">
        <!-- Stats rápidos -->
        <div class="layout-drawer__stats q-pa-md">
          <!-- Contenedor flex para alinear el logo y el texto -->
          <div class="row items-center q-mb-xs">
            <!-- Acordate de poner tu imagen en la carpeta public -->
            <img src="../assets/World-Cup-2026-Logo-PNG.webp" style="height: 32px; margin-right: 10px;" />
            <div class="text-h6 text-weight-bold">{{ t('layout.myAlbumTitle') }}</div>
          </div>
          
          <div class="row q-gutter-sm">
            <q-chip dense color="positive"   text-color="white" icon="check_circle">{{ album.stats.value.ownedCount }} {{ t('layout.owned') }}</q-chip>
            <q-chip dense color="negative"   text-color="white" icon="cancel">{{ album.stats.value.missingCount }} {{ t('layout.missing') }}</q-chip>
            <q-chip dense color="deep-orange" text-color="white" icon="star">{{ album.stats.value.totalDupes }} {{ t('layout.duplicates') }}</q-chip>
          </div>
        </div>

        <q-separator />

        <!-- Navegación -->
        <q-list padding>
          <q-item
            clickable
            v-ripple
            :active="$route.name === 'album'"
            active-class="text-primary"
            @click="$router.push({ name: 'album' }); drawer = false"
          >
            <q-item-section avatar><q-icon name="menu_book" /></q-item-section>
            <q-item-section>{{ t('common.myAlbum') }}</q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            :active="$route.name === 'exchange'"
            active-class="text-primary"
            @click="$router.push({ name: 'exchange' }); drawer = false"
          >
            <q-item-section avatar><q-icon name="swap_horiz" /></q-item-section>
            <q-item-section>{{ t('common.exchanges') }}</q-item-section>
            <q-item-section side v-if="album.stats.value.totalDupes > 0">
              <q-badge color="deep-orange">{{ album.stats.value.totalDupes }}</q-badge>
            </q-item-section>
          </q-item>
        </q-list>

        <q-separator />

        <!-- Leyenda de estados -->
        <div class="q-pa-md">
          <div class="text-caption text-grey q-mb-sm text-uppercase text-weight-bold">{{ t('layout.legend') }}</div>
          <div class="column q-gutter-xs">
            <div class="row items-center q-gutter-sm">
              <div class="legend-chip legend-chip--missing" />
              <span class="text-caption">{{ t('layout.missingSticker') }}</span>
            </div>
            <div class="row items-center q-gutter-sm">
              <div class="legend-chip legend-chip--owned" />
              <span class="text-caption">{{ t('layout.ownedSticker') }}</span>
            </div>
            <div class="row items-center q-gutter-sm">
              <div class="legend-chip legend-chip--repeated" />
              <span class="text-caption">{{ t('layout.repeatedSticker') }}</span>
            </div>
            <div class="row items-center q-gutter-sm">
              <q-icon name="touch_app" size="xs" color="grey" />
              <span class="text-caption">{{ t('layout.longPress') }}</span>
            </div>
          </div>
        </div>
      </q-scroll-area>
    </q-drawer>

    <!-- ── PAGE ────────────────────────────────────────────────────────── -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- ── Panel de notificaciones ────────────────────────────────────── -->
    <q-drawer
      v-model="notifDrawer"
      side="right"
      :width="320"
      bordered
      overlay
    >
      <q-toolbar class="bg-primary text-white">
        <q-icon name="notifications" class="q-mr-sm" />
        <q-toolbar-title>{{ t('layout.notifications') }}</q-toolbar-title>
        <q-btn flat round dense icon="close" @click="notifDrawer = false" />
      </q-toolbar>

      <q-scroll-area class="fit">
        <div
          v-if="album.pendingProposals.value.length === 0"
          class="column items-center justify-center text-grey q-pa-xl"
          style="min-height:200px"
        >
          <q-icon name="notifications_none" size="48px" color="grey-4" />
          <div class="q-mt-sm text-caption">{{ t('layout.noNotifications') }}</div>
        </div>

        <q-list separator v-else>
          <q-item
            v-for="p in album.pendingProposals.value"
            :key="p.id"
            class="q-py-md"
          >
            <q-item-section avatar top>
              <q-avatar color="primary" text-color="white" size="44px">
                <img v-if="p.fromPhoto" :src="p.fromPhoto" />
                <span v-else>{{ (p.fromDisplayName || '?')[0].toUpperCase() }}</span>
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold">
                {{ p.fromDisplayName }}
                <span class="text-caption text-grey">@{{ p.fromAlias }}</span>
              </q-item-label>
              <q-item-label caption class="q-mt-xs">
                {{ t('exchange.wantsToExchange') }}
              </q-item-label>
              <q-item-label caption class="q-mt-xs">
                <q-icon name="arrow_upward" color="deep-orange" size="xs" />
                {{ t('exchange.gives') }} <strong>{{ p.receiverGives?.length ?? 0 }}</strong> {{ t('exchange.stickers') }}
                &nbsp;|&nbsp;
                <q-icon name="arrow_downward" color="positive" size="xs" />
                {{ t('exchange.youGive') }} <strong>{{ p.senderGives?.length ?? 0 }}</strong>
              </q-item-label>

              <div class="row q-gutter-sm q-mt-sm">
                <q-btn
                  unelevated rounded dense
                  color="positive"
                  icon="check"
                  :label="t('exchange.accept')"
                  size="sm"
                  :loading="respondingId === p.id + 'y'"
                  @click="respond(p.id, true)"
                />
                <q-btn
                  outline rounded dense
                  color="negative"
                  icon="close"
                  :label="t('exchange.reject')"
                  size="sm"
                  :loading="respondingId === p.id + 'n'"
                  @click="respond(p.id, false)"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
import { useThemePreference } from 'src/composables/useThemePreference'
import { useLanguage } from 'src/composables/useLanguage'
import { useFirebaseAlbum } from 'src/composables/useFirebaseAlbum'

const $q        = useQuasar()
const authStore = useAuthStore()
const album     = useFirebaseAlbum()
const { toggleTheme } = useThemePreference()
const { t, languages, currentLanguage, changeLanguage } = useLanguage()
const drawer    = ref(false)

// Notificaciones
const notifDrawer  = ref(false)
const respondingId = ref(null)

async function respond(exchangeId, accept) {
  respondingId.value = exchangeId + (accept ? 'y' : 'n')
  try {
    await album.respondToProposal(exchangeId, accept)
    $q.notify({
      type:    accept ? 'positive' : 'info',
      message: accept ? t('exchange.proposalsAccepted') : t('exchange.proposalRejected'),
    })
  } catch {
    $q.notify({ type: 'negative', message: t('exchange.proposalError') })
  } finally {
    respondingId.value = null
  }
}
</script>

<style lang="scss" scoped>
.layout-header {
  background: linear-gradient(135deg, #1565C0 0%, #0D47A1 100%);

  &__title { font-size: 16px; }
}

.layout-drawer {
  .layout-drawer__stats {
    background: rgba(21, 101, 192, 0.05);
  }
}

.legend-chip {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid transparent;

  &--missing  { background: rgba(0,0,0,0.08); border-color: rgba(0,0,0,0.15); }
  &--owned    { background: #BBDEFB; border-color: #1565C0; }
  &--repeated { background: linear-gradient(135deg, #FF6F00, #FFD600); border-color: #FF6F00; }
}
</style>
