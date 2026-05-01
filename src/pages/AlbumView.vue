<template>
  <!--
    AlbumView.vue
    Vista principal: renderiza todas las secciones del álbum
    con q-expansion-item y la grilla de StickerCard.
  -->
  <q-page class="album-view">

    <!-- ── Barra de búsqueda + filtros ──────────────────────────────── -->
    <div class="album-view__toolbar q-px-md q-pt-md q-pb-sm sticky-toolbar">
      <q-input
        v-model="searchQuery"
        dense
        outlined
        rounded
        clearable
        placeholder="Buscar figurita o selección…"
        class="q-mb-sm"
      >
        <template #prepend><q-icon name="search" /></template>
      </q-input>

      <div class="row q-gutter-sm items-center">
        <!-- Filtro por estado -->
        <q-btn-toggle
          v-model="filterState"
          dense
          rounded
          no-caps
          unelevated
          :options="STATE_FILTERS"
          color="grey-4"
          text-color="dark"
          toggle-color="primary"
          class="filter-toggle"
        />

        <!-- Filtro por confederación -->
        <q-select
          v-model="filterConf"
          :options="CONF_OPTIONS"
          dense
          rounded
          outlined
          emit-value
          map-options
          clearable
          placeholder="Confederación"
          style="min-width:140px; font-size:12px"
        />
      </div>
    </div>

    <!-- ── Skeleton mientras carga ─────────────────────────────────── -->
    <template v-if="album.loading.value">
      <div class="q-pa-md">
        <q-skeleton type="rect" height="50px" class="q-mb-sm" v-for="n in 6" :key="n" />
      </div>
    </template>

    <!-- ── Contenido del álbum ─────────────────────────────────────── -->
    <q-list v-else padding class="album-view__list">
      <template v-for="section in filteredSections" :key="section.id">
        <q-expansion-item
          v-model="openSections[section.id]"
          :header-class="`section-header section-header--${section.confederation || 'special'}`"
          :style="`--sec-color: ${section.color}`"
          expand-separator
          dense-toggle
          switch-toggle-side
        >
          <!-- ── Header personalizado ── -->
          <template #header>
            <q-item-section avatar>
              <q-avatar size="36px" :style="`background:${section.color}20; color:${section.color}`">
                <span v-if="section.flag" style="font-size:20px">{{ section.flag }}</span>
                <q-icon v-else :name="section.icon" size="20px" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold">{{ section.name }}</q-item-label>
              <q-item-label caption>{{ sectionProgress(section) }}</q-item-label>
            </q-item-section>

            <q-item-section side>
              <!-- Mini barra de progreso por sección -->
              <q-circular-progress
                :value="sectionPercent(section)"
                size="32px"
                :thickness="0.22"
                :color="sectionPercent(section) === 100 ? 'positive' : 'primary'"
                track-color="grey-3"
                class="q-mr-sm"
              >
                <span style="font-size:8px; font-weight:700">{{ sectionPercent(section) }}%</span>
              </q-circular-progress>
            </q-item-section>
          </template>

          <!-- ── Grilla de figuritas ── -->
          <div class="sticker-grid q-pa-sm">
            <StickerCard
              v-for="sticker in visibleStickers(section)"
              :key="sticker.id"
              :sticker="sticker"
              :count="album.getCount(sticker.id)"
              :team-color="section.color"
              @update="album.updateSticker"
            />
          </div>

          <!-- Mensaje si todos filtrados -->
          <div
            v-if="visibleStickers(section).length === 0"
            class="text-center text-grey q-py-md text-caption"
          >
            No hay figuritas con este filtro
          </div>
        </q-expansion-item>
      </template>

      <!-- Sin resultados -->
      <div v-if="filteredSections.length === 0" class="text-center q-pa-xl">
        <q-icon name="search_off" size="48px" color="grey-4" />
        <div class="text-grey q-mt-sm">Sin resultados para "{{ searchQuery }}"</div>
      </div>
    </q-list>

    <!-- ── FAB de estadísticas ─────────────────────────────────────── -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-fab
        v-model="fabOpen"
        color="primary"
        icon="bar_chart"
        direction="up"
        vertical-actions-align="right"
      >
        <q-fab-action color="positive"    icon="check_circle"  :label="`${album.stats.value.ownedCount} Tengo`"   label-position="left" />
        <q-fab-action color="negative"    icon="cancel"        :label="`${album.stats.value.missingCount} Faltan`" label-position="left" />
        <q-fab-action color="deep-orange" icon="star"          :label="`${album.stats.value.totalDupes} Repet.`"  label-position="left" />
        <q-fab-action color="accent"      icon="percent"       :label="`${album.stats.value.percent}% completo`" label-position="left" text-color="dark" />
        <q-fab-action
          color="secondary"
          icon="expand_less"
          label="Abrir todo"
          label-position="left"
          @click="expandAll"
        />
        <q-fab-action
          color="grey"
          icon="expand_more"
          label="Cerrar todo"
          label-position="left"
          @click="collapseAll"
        />
      </q-fab>
    </q-page-sticky>
  </q-page>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted, watch } from 'vue'
import { ALBUM_SECTIONS, SECTIONS_BY_CONFEDERATION } from 'src/data/albumData'
import { useFirebaseAlbum } from 'src/composables/useFirebaseAlbum'
import StickerCard from 'src/components/StickerCard.vue'

// ── Composable del álbum ─────────────────────────────────────────────
const album = useFirebaseAlbum()

onMounted(() => album.subscribeToAlbum())
onUnmounted(() => album.unsubscribeFromAlbum())

// ── Estado local ─────────────────────────────────────────────────────
const searchQuery = ref('')
const filterState = ref('all')
const filterConf  = ref(null)
const fabOpen     = ref(false)

// Track de secciones abiertas
const openSections = reactive(
  Object.fromEntries(ALBUM_SECTIONS.map((s) => [s.id, false]))
)
// Abrir la sección Especiales por defecto
openSections['especiales'] = true

// ── Opciones de filtros ──────────────────────────────────────────────
const STATE_FILTERS = [
  { label: 'Todas',    value: 'all'      },
  { label: 'Faltan',   value: 'missing'  },
  { label: 'Tengo',    value: 'owned'    },
  { label: 'Repetidas',value: 'repeated' },
]

const CONF_OPTIONS = [
  ...SECTIONS_BY_CONFEDERATION.map((c) => ({ label: c.name, value: c.code })),
]

// ── Lógica de filtrado ────────────────────────────────────────────────
function stickerMatchesFilter(sticker) {
  const count = album.getCount(sticker.id)
  if (filterState.value === 'missing'  && count !== 0)  return false
  if (filterState.value === 'owned'    && count < 1)    return false
  if (filterState.value === 'repeated' && count < 2)    return false
  return true
}

function visibleStickers(section) {
  if (filterState.value === 'all' && !searchQuery.value) return section.stickers
  return section.stickers.filter((s) => {
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      const matches =
        String(s.id).includes(q) ||
        s.label.toLowerCase().includes(q) ||
        section.name.toLowerCase().includes(q)
      if (!matches) return false
    }
    return stickerMatchesFilter(s)
  })
}

const filteredSections = computed(() => {
  return ALBUM_SECTIONS.filter((section) => {
    // Filtro de confederación
    if (filterConf.value && section.confederation !== filterConf.value) return false
    // Si hay búsqueda o filtro de estado, ocultar secciones vacías
    if (filterState.value !== 'all' || searchQuery.value) {
      return visibleStickers(section).length > 0
    }
    return true
  })
})

// Auto-expandir secciones cuando se filtra
watch([filterState, filterConf, searchQuery], () => {
  if (filterState.value !== 'all' || searchQuery.value) {
    filteredSections.value.forEach((s) => { openSections[s.id] = true })
  }
})

// ── Progreso por sección ─────────────────────────────────────────────
function sectionProgress(section) {
  const owned = section.stickers.filter((s) => album.getCount(s.id) >= 1).length
  const total = section.stickers.length
  return `${owned} / ${total} figuritas`
}

function sectionPercent(section) {
  const owned = section.stickers.filter((s) => album.getCount(s.id) >= 1).length
  return Math.round((owned / section.stickers.length) * 100)
}

// ── Expandir / colapsar todo ─────────────────────────────────────────
function expandAll()  { ALBUM_SECTIONS.forEach((s) => { openSections[s.id] = true }) }
function collapseAll(){ ALBUM_SECTIONS.forEach((s) => { openSections[s.id] = false }) }
</script>

<style lang="scss" scoped>
.album-view {
  max-width: 900px;
  margin: 0 auto;

  // ── Toolbar sticky ─────────────────────────────────────────────────
  .sticky-toolbar {
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--q-color-background, white);
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);

    .body--dark & { background: var(--q-color-dark-page, #121212); }
  }

  // ── Encabezado de sección ───────────────────────────────────────────
  :deep(.section-header) {
    border-left: 4px solid var(--sec-color, #1565C0);
    transition: background 0.2s;

    &:hover { background: rgba(0,0,0,0.03); }
    .body--dark &:hover { background: rgba(255,255,255,0.04); }
  }

  // ── Grilla de figuritas ─────────────────────────────────────────────
  .sticker-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: flex-start;
    background: var(--q-color-background, white);

    .body--dark & { background: rgba(255,255,255,0.02); }

    @media (max-width: 400px) { gap: 4px; }
  }
}

// Estilos del filtro toggle
.filter-toggle :deep(.q-btn) {
  font-size: 11px !important;
  padding: 4px 8px !important;
}
</style>
