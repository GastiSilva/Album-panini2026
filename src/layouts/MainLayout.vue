<template>
  <q-layout view="lHh Lpr lFf" class="main-layout">

    <q-header elevated class="main-header">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleDrawer" />
        <q-toolbar-title>
          <q-icon name="sports_soccer" color="yellow-6" size="28px" class="q-mr-xs" />
          <span class="text-weight-bold">Álbum 2026</span>
        </q-toolbar-title>

        <!-- User avatar chip -->
        <q-chip
          dense
          color="yellow-8"
          text-color="black"
          icon="person"
          class="q-mr-sm"
        >
          {{ userStore.displayName || 'Usuario' }}
        </q-chip>
      </q-toolbar>
    </q-header>

    <!-- Side drawer -->
    <q-drawer
      v-model="drawerOpen"
      show-if-above
      :width="220"
      :breakpoint="700"
      dark
      class="main-drawer"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="text-h6 text-yellow-6 q-mb-md">
            🏆 Mundial 2026
          </div>
        </div>
        <q-list padding>
          <q-item
            v-for="item in navItems"
            :key="item.name"
            clickable
            :active="$route.name === item.name"
            active-class="nav-active"
            v-ripple
            @click="navigate(item.name)"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- Page content -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Bottom navigation bar (mobile) -->
    <q-footer class="bottom-nav" bordered>
      <q-tabs
        v-model="activeRoute"
        align="justify"
        class="bottom-tabs"
        active-color="yellow-6"
        indicator-color="yellow-6"
      >
        <q-tab
          v-for="item in navItems"
          :key="item.name"
          :name="item.name"
          :icon="item.icon"
          :label="item.label"
          @click="navigate(item.name)"
        />
      </q-tabs>
    </q-footer>

  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from 'src/stores/userStore.js'

const router     = useRouter()
const route      = useRoute()
const userStore  = useUserStore()
const drawerOpen = ref(false)

const navItems = [
  { name: 'album',     icon: 'menu_book',   label: 'Álbum' },
  { name: 'exchange',  icon: 'swap_horiz',  label: 'Intercambios' }
]

const activeRoute = computed(() => route.name)

function toggleDrawer () {
  drawerOpen.value = !drawerOpen.value
}

function navigate (name) {
  drawerOpen.value = false
  router.push({ name })
}
</script>

<style scoped lang="scss">
.main-layout {
  background-color: #0a0a2e;
}

.main-header {
  background: linear-gradient(135deg, #0d0d3b 0%, #1a1a5e 100%);
  border-bottom: 1px solid #2a2a6a;
}

.main-drawer {
  background: #0d0d3b !important;
  border-right: 1px solid #2a2a6a;
}

.bottom-nav {
  background: #0d0d3b !important;
  border-top: 1px solid #2a2a6a;
}

.bottom-tabs {
  background: transparent;
}

.nav-active {
  background: rgba(255, 215, 0, 0.15);
  color: #fdd835 !important;
  border-radius: 8px;
}
</style>
