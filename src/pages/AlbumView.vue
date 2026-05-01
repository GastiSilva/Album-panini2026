<template>
  <q-page class="q-pa-sm">

    <!-- Barra de busqueda -->
    <q-input
      v-model="searchText"
      filled dense clearable
      label="Buscar figurita (nombre o numero)"
      class="q-mb-md"
    >
      <template #prepend><q-icon name="search" /></template>
    </q-input>

    <!-- Modo busqueda: resultados planos -->
    <template v-if="searchText">
      <div class="row q-gutter-xs justify-start">
        <StickerCard
          v-for="s in searchResults"
          :key="s.id"
          :sticker="s"
          :count="album.getCount(s.id)"
          @update="album.updateSticker"
        />
      </div>
      <div v-if="!searchResults.length" class="text-center text-grey q-mt-xl">
        <q-icon name="search_off" size="3rem" />
        <p>Sin resultados para "{{ searchText }}"</p>
      </div>
    </template>

    <!-- Vista por grupos -->
    <template v-else>

      <!-- ESPECIALES -->
      <q-expansion-item
        v-model="openSections['especiales']"
        expand-separator
        header-class="text-white"
        :style="{ backgroundColor: ESPECIALES_SECTION.color }"
        class="rounded-borders q-mb-sm overflow-hidden"
      >
        <template #header>
          <q-item-section>
            <div class="text-subtitle1 text-weight-bold">ESPECIALES</div>
            <div class="text-caption">
              {{ ownedInSection(ESPECIALES_SECTION) }} / {{ ESPECIALES_SECTION.stickers.length }}
            </div>
          </q-item-section>
          <q-item-section side>
            <q-chip dense color="white" text-color="dark" size="sm">
              {{ sectionPercent(ESPECIALES_SECTION) }}%
            </q-chip>
          </q-item-section>
        </template>
        <div class="q-pa-sm bg-grey-10 row q-gutter-xs justify-start">
          <StickerCard
            v-for="s in ESPECIALES_SECTION.stickers"
            :key="s.id"
            :sticker="s"
            :count="album.getCount(s.id)"
            @update="album.updateSticker"
          />
        </div>
      </q-expansion-item>

      <!-- GRUPOS A-L -->
      <q-expansion-item
        v-for="group in GROUP_SECTIONS"
        :key="group.id"
        v-model="openSections[group.id]"
        expand-separator
        header-class="text-white"
        :style="{ backgroundColor: group.color }"
        class="rounded-borders q-mb-sm overflow-hidden"
      >
        <template #header>
          <q-item-section>
            <div class="text-subtitle1 text-weight-bold">{{ group.label }}</div>
            <div class="text-caption">
              {{ ownedInGroup(group) }} / {{ stickersInGroup(group) }}
            </div>
          </q-item-section>
          <q-item-section side>
            <q-chip dense color="white" text-color="dark" size="sm">
              {{ groupPercent(group) }}%
            </q-chip>
          </q-item-section>
        </template>

        <div class="q-pa-xs">
          <q-expansion-item
            v-for="team in group.teams"
            :key="team.id"
            v-model="openTeams[team.id]"
            dense
            expand-separator
            class="q-mb-xs rounded-borders overflow-hidden"
            header-class="text-white"
            :style="{ backgroundColor: darken(group.color) }"
          >
            <template #header>
              <q-item-section avatar>
                <img :src="team.flag" :alt="team.name" style="height:24px; width:auto; border-radius:2px" />
              </q-item-section>
              <q-item-section>
                <div class="text-body2 text-weight-medium">{{ team.name }}</div>
                <div class="text-caption">
                  {{ ownedInTeam(team) }} / {{ team.stickers.length }}
                </div>
              </q-item-section>
              <q-item-section side>
                <q-linear-progress
                  :value="teamPercent(team) / 100"
                  color="white"
                  track-color="rgba(255,255,255,0.3)"
                  size="6px"
                  style="width:60px"
                  rounded
                />
              </q-item-section>
            </template>
            <div class="q-pa-sm bg-grey-10 row q-gutter-xs justify-start">
              <StickerCard
                v-for="s in team.stickers"
                :key="s.id"
                :sticker="s"
                :count="album.getCount(s.id)"
                @update="album.updateSticker"
              />
            </div>
          </q-expansion-item>
        </div>
      </q-expansion-item>

      <!-- COCA-COLA -->
      <q-expansion-item
        v-model="openSections['cocacola']"
        expand-separator
        header-class="text-white"
        :style="{ backgroundColor: COCACOLA_SECTION.color }"
        class="rounded-borders q-mb-sm overflow-hidden"
      >
        <template #header>
          <q-item-section>
            <div class="text-subtitle1 text-weight-bold">Bebida de Coca-Cola</div>
            <div class="text-caption">
              {{ ownedInSection(COCACOLA_SECTION) }} / {{ COCACOLA_SECTION.stickers.length }}
            </div>
          </q-item-section>
          <q-item-section side>
            <q-chip dense color="white" text-color="dark" size="sm">
              {{ sectionPercent(COCACOLA_SECTION) }}%
            </q-chip>
          </q-item-section>
        </template>
        <div class="q-pa-sm bg-grey-10 row q-gutter-xs justify-start">
          <StickerCard
            v-for="s in COCACOLA_SECTION.stickers"
            :key="s.id"
            :sticker="s"
            :count="album.getCount(s.id)"
            @update="album.updateSticker"
          />
        </div>
      </q-expansion-item>

    </template>

    <!-- FAB Stats -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="bar_chart" color="primary" @click="showStats = true" />
    </q-page-sticky>

    <!-- Dialog Stats -->
    <q-dialog v-model="showStats">
      <q-card style="min-width:280px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Mi Album</div>
        </q-card-section>
        <q-card-section>
          <q-list>
            <q-item>
              <q-item-section>Completado</q-item-section>
              <q-item-section side>
                <q-chip color="primary" text-color="white">{{ album.stats.value.percent }}%</q-chip>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Figuritas</q-item-section>
              <q-item-section side class="text-positive text-weight-bold">{{ album.stats.value.ownedCount }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Duplicadas</q-item-section>
              <q-item-section side class="text-warning text-weight-bold">{{ album.stats.value.totalDupes }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Me faltan</q-item-section>
              <q-item-section side class="text-negative text-weight-bold">{{ album.stats.value.missingCount }}</q-item-section>
            </q-item>
          </q-list>
          <q-linear-progress :value="album.stats.value.percent / 100" color="primary" size="12px" rounded class="q-mt-sm" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { useFirebaseAlbum } from 'src/composables/useFirebaseAlbum'
import { ESPECIALES_SECTION, GROUP_SECTIONS, ALBUM_SECTIONS, COCACOLA_SECTION } from 'src/data/albumData'
import StickerCard from 'src/components/StickerCard.vue'

const album      = useFirebaseAlbum()
const showStats  = ref(false)
const searchText = ref('')

const openSections = reactive({ especiales: false, cocacola: false })
GROUP_SECTIONS.forEach(g => { openSections[g.id] = false })

const openTeams = reactive({})
GROUP_SECTIONS.forEach(g => g.teams.forEach(t => { openTeams[t.id] = false }))

const searchResults = computed(() => {
  const q = searchText.value.trim().toLowerCase()
  if (!q) return []
  return ALBUM_SECTIONS.flatMap(s => s.stickers).filter(s =>
    String(s.id).includes(q) ||
    (s.name || '').toLowerCase().includes(q) ||
    (s.team || '').toLowerCase().includes(q)
  )
})

function ownedInSection(section) {
  return section.stickers.filter(s => album.getCount(s.id) > 0).length
}
function sectionPercent(section) {
  if (!section.stickers.length) return 0
  return Math.round((ownedInSection(section) / section.stickers.length) * 100)
}
function stickersInGroup(group) {
  return group.teams.reduce((a, t) => a + t.stickers.length, 0)
}
function ownedInGroup(group) {
  return group.teams.reduce((a, t) => a + ownedInTeam(t), 0)
}
function groupPercent(group) {
  const total = stickersInGroup(group)
  if (!total) return 0
  return Math.round((ownedInGroup(group) / total) * 100)
}
function ownedInTeam(team) {
  return team.stickers.filter(s => album.getCount(s.id) > 0).length
}
function teamPercent(team) {
  if (!team.stickers.length) return 0
  return Math.round((ownedInTeam(team) / team.stickers.length) * 100)
}
function darken(hex) {
  try {
    const h = hex.replace('#','')
    const r = Math.max(0, parseInt(h.slice(0,2),16) - 40)
    const g = Math.max(0, parseInt(h.slice(2,4),16) - 40)
    const b = Math.max(0, parseInt(h.slice(4,6),16) - 40)
    return `rgb(${r},${g},${b})`
  } catch { return hex }
}

onMounted(() => album.subscribeToAlbum())
onUnmounted(() => album.unsubscribeFromAlbum())
</script>
