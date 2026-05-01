<template>
  <q-page class="exchange-view q-pa-md">
    <div class="text-h6 text-weight-bold q-mb-md">
      <q-icon name="swap_horiz" class="q-mr-sm" />Intercambios con amigos
    </div>

    <!-- ── Mis repetidas ──────────────────────────────────────────── -->
    <q-card flat bordered class="q-mb-lg">
      <q-card-section class="q-pb-sm">
        <div class="text-subtitle1 text-weight-bold">
          <q-icon name="star" color="deep-orange" /> Mis figuritas repetidas
          <q-badge color="deep-orange" class="q-ml-sm" v-if="myRepeated.length">
            {{ myRepeated.length }} tipos · {{ album.stats.value.totalDupes }} extras
          </q-badge>
        </div>
        <div class="text-caption text-grey">Estas son las que puedes ofrecer para intercambio</div>
      </q-card-section>

      <q-separator />

      <q-card-section v-if="myRepeated.length === 0" class="text-center text-grey q-py-lg">
        <q-icon name="sentiment_satisfied" size="40px" color="grey-4" />
        <div class="q-mt-sm">Aún no tienes figuritas repetidas</div>
      </q-card-section>

      <q-card-section v-else class="q-pt-sm">
        <!-- Agrupadas por sección -->
        <div
          v-for="(group, sectionName) in repeatedBySection"
          :key="sectionName"
          class="q-mb-md"
        >
          <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">{{ sectionName }}</div>
          <div class="sticker-row">
            <StickerCard
              v-for="item in group"
              :key="item.sticker.id"
              :sticker="item.sticker"
              :count="item.count"
              :team-color="item.color"
              readonly
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- ── Buscar amigo ───────────────────────────────────────────── -->
    <q-card flat bordered>
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold q-mb-sm">
          <q-icon name="people" color="primary" /> Comparar con un amigo
        </div>

        <q-input
          v-model="friendUid"
          outlined
          dense
          rounded
          clearable
          label="UID del amigo (desde Firebase)"
          placeholder="Pega el UID de tu amigo"
          class="q-mb-sm"
        >
          <template #prepend><q-icon name="badge" /></template>
          <template #append>
            <q-btn
              round flat dense
              icon="search"
              color="primary"
              :loading="loadingFriend"
              @click="loadFriend"
            />
          </template>
        </q-input>

        <!-- Tu propio UID para compartir -->
        <div class="text-caption text-grey q-mb-md">
          Tu UID:
          <code
            class="uid-chip"
            @click="copyUid"
            title="Click para copiar"
          >{{ authStore.userId }}</code>
          <q-icon name="content_copy" size="xs" class="q-ml-xs cursor-pointer" @click="copyUid" />
        </div>

        <!-- Resultado de la comparación -->
        <template v-if="friendData">
          <q-separator class="q-mb-md" />
          <div class="row items-center q-mb-md q-gutter-sm">
            <q-avatar size="40px" color="primary" text-color="white">
              <img v-if="friendData.photoURL" :src="friendData.photoURL" />
              <span v-else>{{ (friendData.displayName || '?')[0].toUpperCase() }}</span>
            </q-avatar>
            <div>
              <div class="text-weight-bold">{{ friendData.displayName }}</div>
              <div class="text-caption text-grey">
                {{ Object.keys(friendData.owned || {}).length }} figuritas
              </div>
            </div>
          </div>

          <!-- Figuritas que el amigo tiene repetidas y yo me faltan -->
          <div class="text-subtitle2 text-weight-bold q-mb-sm text-positive">
            <q-icon name="arrow_downward" /> Me puede dar (él repite, yo falta)
          </div>
          <div v-if="theyCanGive.length === 0" class="text-caption text-grey q-mb-md">
            No hay coincidencias en este momento
          </div>
          <div v-else class="sticker-row q-mb-md">
            <StickerCard
              v-for="item in theyCanGive"
              :key="item.stickerId"
              :sticker="STICKERS_MAP[item.stickerId]"
              :count="0"
              readonly
            >
              <template #default>
                <q-badge color="positive" floating>+{{ item.friendHas }}</q-badge>
              </template>
            </StickerCard>
          </div>

          <!-- Figuritas que yo tengo repetidas y él le faltan -->
          <div class="text-subtitle2 text-weight-bold q-mb-sm text-deep-orange">
            <q-icon name="arrow_upward" /> Yo le puedo dar (yo repito, él falta)
          </div>
          <div v-if="iCanGive.length === 0" class="text-caption text-grey">
            No hay coincidencias en este momento
          </div>
          <div v-else class="sticker-row">
            <StickerCard
              v-for="item in iCanGive"
              :key="item.sticker.id"
              :sticker="item.sticker"
              :count="item.count"
              :team-color="item.color"
              readonly
            />
          </div>
        </template>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { copyToClipboard, Notify } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
import { useFirebaseAlbum } from 'src/composables/useFirebaseAlbum'
import { STICKERS_MAP, ALBUM_SECTIONS } from 'src/data/albumData'
import StickerCard from 'src/components/StickerCard.vue'

const authStore     = useAuthStore()
const album         = useFirebaseAlbum()

const friendUid     = ref('')
const friendData    = ref(null)
const loadingFriend = ref(false)

// ── Mis repetidas ─────────────────────────────────────────────────────
const myRepeated = computed(() =>
  Object.entries(album.owned.value)
    .filter(([, v]) => v > 1)
    .map(([id, count]) => {
      const sticker = STICKERS_MAP[Number(id)]
      if (!sticker) return null
      const section = ALBUM_SECTIONS.find((s) => s.id === sticker.sectionId)
      return { sticker, count, color: section?.color || '#1565C0', sectionName: sticker.sectionName }
    })
    .filter(Boolean)
)

// Agrupar por sección
const repeatedBySection = computed(() => {
  return myRepeated.value.reduce((acc, item) => {
    const key = item.sectionName
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})
})

// ── Comparativa con amigo ─────────────────────────────────────────────
async function loadFriend() {
  if (!friendUid.value.trim()) return
  loadingFriend.value = true
  try {
    const data = await album.getFriendAlbum(friendUid.value.trim())
    if (data) {
      friendData.value = data
    } else {
      Notify.create({ type: 'warning', message: 'Usuario no encontrado' })
      friendData.value = null
    }
  } finally {
    loadingFriend.value = false
  }
}

// Figuritas que el amigo puede darme (él repite, yo falta)
const theyCanGive = computed(() => {
  if (!friendData.value?.owned) return []
  return album.getExchangeCandidates(friendData.value.owned)
})

// Figuritas que yo le puedo dar (yo repito, él falta)
const iCanGive = computed(() => {
  if (!friendData.value?.owned) return myRepeated.value
  const friendOwned = friendData.value.owned
  return myRepeated.value.filter(({ sticker }) => {
    return !friendOwned[String(sticker.id)] || friendOwned[String(sticker.id)] === 0
  })
})

// ── Copiar UID ───────────────────────────────────────────────────────
function copyUid() {
  copyToClipboard(authStore.userId).then(() => {
    Notify.create({ type: 'positive', message: 'UID copiado al portapapeles', icon: 'content_copy' })
  })
}
</script>

<style lang="scss" scoped>
.exchange-view {
  max-width: 900px;
  margin: 0 auto;
}

.sticker-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.uid-chip {
  background: rgba(0,0,0,0.07);
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 11px;
  cursor: pointer;
  user-select: all;
  word-break: break-all;

  .body--dark & { background: rgba(255,255,255,0.1); }
}
</style>
