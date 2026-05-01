<template>
  <q-page class="album-page">

    <!-- ── Header stats bar ───────────────────────────────────────────────── -->
    <div class="stats-bar q-px-md q-py-sm row items-center justify-between">
      <div class="text-h6 text-white">
        🏆 Álbum Mundial 2026
      </div>
      <div class="row q-gutter-sm">
        <q-chip color="green-8" text-color="white" icon="check_circle" dense>
          {{ totalTengo }} / {{ totalStickers }}
        </q-chip>
        <q-chip color="orange-8" text-color="white" icon="star" dense>
          {{ totalRepetidas }} repetidas
        </q-chip>
      </div>
    </div>

    <!-- ── Progress bar ───────────────────────────────────────────────────── -->
    <q-linear-progress
      :value="totalTengo / totalStickers"
      color="green-6"
      track-color="grey-9"
      rounded
      class="q-mx-md progress-bar"
    />

    <!-- ── Loading overlay ───────────────────────────────────────────────── -->
    <div v-if="loading" class="loading-container">
      <q-spinner-dots color="primary" size="60px" />
      <p class="text-grey-4 q-mt-md">Cargando álbum…</p>
    </div>

    <!-- ── Album sections ─────────────────────────────────────────────────── -->
    <div v-else class="q-pa-md">

      <!-- Confederation filter tabs -->
      <q-tabs
        v-model="activeTab"
        dense
        align="left"
        class="conf-tabs q-mb-md"
        active-color="yellow-6"
        indicator-color="yellow-6"
        narrow-indicator
      >
        <q-tab name="all"       label="Todas"    />
        <q-tab name="ESPECIAL"  label="🏆 Esp."  />
        <q-tab name="CONMEBOL"  label="🌎 CONME" />
        <q-tab name="UEFA"      label="🇪🇺 UEFA"  />
        <q-tab name="CONCACAF"  label="🌎 CONCA" />
        <q-tab name="CAF"       label="🌍 CAF"   />
        <q-tab name="AFC"       label="🌏 AFC"   />
        <q-tab name="OFC"       label="🌊 OFC"   />
      </q-tabs>

      <!-- Search bar -->
      <q-input
        v-model="searchQuery"
        dense
        dark
        outlined
        placeholder="Buscar equipo…"
        class="q-mb-md search-input"
        clearable
      >
        <template #prepend>
          <q-icon name="search" color="grey-5" />
        </template>
      </q-input>

      <!-- Sections list -->
      <q-list separator class="sections-list">
        <q-expansion-item
          v-for="section in filteredSections"
          :key="section.id"
          :label="section.flag + ' ' + section.name"
          :caption="sectionCaption(section)"
          header-class="section-header"
          expand-icon-class="text-white"
          dark
          dense
        >
          <!-- Section header additional info -->
          <template #header>
            <q-item-section avatar>
              <span class="text-h5">{{ section.flag }}</span>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-white text-weight-bold">
                {{ section.name }}
              </q-item-label>
              <q-item-label caption class="text-grey-4">
                {{ sectionCaption(section) }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-circular-progress
                :value="sectionProgress(section)"
                size="36px"
                :thickness="0.2"
                color="green-6"
                track-color="grey-8"
                class="q-ma-xs"
                :min="0"
                :max="100"
              >
                <span class="text-white" style="font-size: 9px">
                  {{ sectionHave(section) }}/{{ section.stickers.length }}
                </span>
              </q-circular-progress>
            </q-item-section>
          </template>

          <!-- Sticker grid -->
          <div class="sticker-grid q-pa-sm">
            <StickerCard
              v-for="sticker in section.stickers"
              :key="sticker.id"
              :sticker="sticker"
              :state="getStickerState(sticker.id)"
              :saving="saving"
              @cycle="cycleSticker"
            />
          </div>
        </q-expansion-item>
      </q-list>

    </div>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import StickerCard from 'src/components/StickerCard.vue'
import { albumSections, totalStickers } from 'src/data/albumData.js'
import { useFirebaseAlbum, STATE_TENGO } from 'src/composables/useFirebaseAlbum.js'
import { useUserStore } from 'src/stores/userStore.js'

const {
  loading,
  saving,
  totalTengo,
  totalRepetidas,
  initUser,
  cycleSticker,
  getStickerState,
  destroy
} = useFirebaseAlbum()

const userStore = useUserStore()

// ─── Tabs & filter ────────────────────────────────────────────────────────────
const activeTab   = ref('all')
const searchQuery = ref('')

const filteredSections = computed(() => {
  return albumSections.filter(section => {
    const matchTab = activeTab.value === 'all' || section.confederation === activeTab.value
    const matchSearch = !searchQuery.value ||
      section.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchTab && matchSearch
  })
})

// ─── Per-section helpers ──────────────────────────────────────────────────────
function sectionHave (section) {
  return section.stickers.filter(s => getStickerState(s.id) >= STATE_TENGO).length
}

function sectionProgress (section) {
  return Math.round((sectionHave(section) / section.stickers.length) * 100)
}

function sectionCaption (section) {
  const have  = sectionHave(section)
  const total = section.stickers.length
  return `${have} / ${total} figuritas`
}

// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(async () => {
  await initUser(userStore.userId, userStore.displayName)
})

onUnmounted(() => {
  destroy()
})
</script>

<style scoped lang="scss">
.album-page {
  background-color: #0a0a2e;
  min-height: 100vh;
}

.stats-bar {
  background: linear-gradient(135deg, #0d0d3b 0%, #1a1a5e 100%);
  border-bottom: 1px solid #2a2a6a;
}

.progress-bar {
  height: 6px;
  margin-top: 4px;
  margin-bottom: 4px;
}

.conf-tabs {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow-x: auto;
}

.search-input {
  :deep(.q-field__control) {
    background: rgba(255,255,255,0.07);
  }
}

.sections-list {
  background: transparent;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.section-header) {
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
  color: white;
  border-radius: 4px;
  margin-bottom: 2px;

  &:hover {
    background: linear-gradient(135deg, #283593 0%, #3949ab 100%);
  }
}

:deep(.q-expansion-item__content) {
  background: #0d0d2e;
}

.sticker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  gap: 6px;
}

@media (min-width: 600px) {
  .sticker-grid {
    grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
  }
}

@media (min-width: 1024px) {
  .sticker-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 8px;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}
</style>
