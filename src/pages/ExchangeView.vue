<template>
  <q-page class="exchange-view q-pa-md">
    <div class="text-h6 text-weight-bold q-mb-md">
      <q-icon name="swap_horiz" class="q-mr-sm" />{{ t('exchange.title') }}
    </div>

    <!-- ── Mis repetidas ──────────────────────────────────────────── -->
    <q-card flat bordered class="q-mb-lg">
      <q-card-section class="q-pb-sm">
        <div class="row items-center q-mb-xs">
          <div class="text-subtitle1 text-weight-bold">
            <q-icon name="star" color="deep-orange" /> {{ t('exchange.myDuplicates') }}
            <q-badge color="deep-orange" class="q-ml-sm" v-if="myRepeated.length">
              {{ myRepeated.length }} tipos · {{ album.stats.value.totalDupes }} extras
            </q-badge>
          </div>
        </div>
        <div class="text-caption text-grey q-mb-sm">{{ t('exchange.myDuplicatesDesc') }}</div>
        <q-btn
          v-if="myRepeated.length"
          unelevated rounded
          color="deep-orange"
          icon="tune"
          :label="t('exchange.manageRepeated')"
          size="sm"
          class="full-width"
          @click="showEditRepeated = true"
        />
      </q-card-section>

      <q-separator />

      <q-card-section v-if="myRepeated.length === 0" class="text-center text-grey q-py-lg">
        <q-icon name="sentiment_satisfied" size="40px" color="grey-4" />
        <div class="q-mt-sm">{{ t('exchange.noDuplicates') }}</div>
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
          <q-icon name="people" color="primary" /> {{ t('exchange.compareWithFriend') }}
        </div>

        <q-input
          v-model="friendAlias"
          outlined
          dense
          rounded
          clearable
          :label="t('exchange.friendAlias')"
          :placeholder="t('exchange.friendAliasPlaceholder')"
          class="q-mb-sm"
          @keyup.enter="loadFriend"
        >
          <template #prepend><q-icon name="alternate_email" /></template>
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

        <!-- Tu propio Apodo para compartir -->
        <div class="text-caption text-grey q-mb-md">
          {{ t('exchange.yourAlias') }}
          <code
            class="uid-chip text-weight-bold"
            @click="copyAlias"
            :title="t('exchange.copy')"
          >@{{ album.alias?.value || 'No definido' }}</code>
          <q-icon name="content_copy" size="xs" class="q-ml-xs cursor-pointer" @click="copyAlias" />
          
          <!-- Botoncito para editar -->
          <q-btn 
            flat round dense 
            icon="edit" 
            size="xs" 
            color="primary" 
            class="q-ml-sm" 
            @click="editarApodo" 
          />
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
            <q-icon name="arrow_downward" /> {{ t('exchange.gives') }}
          </div>
          <div v-if="theyCanGive.length === 0" class="text-caption text-grey q-mb-md">
            No hay coincidencias en este momento
          </div>
          <div v-else class="sticker-row q-mb-md">
            <div
              v-for="item in theyCanGive"
              :key="item.stickerId"
              style="position:relative; display:inline-block"
            >
              <StickerCard
                v-if="STICKERS_MAP[item.stickerId]"
                :sticker="STICKERS_MAP[item.stickerId]"
                :count="0"
                readonly
              />
              <q-badge color="positive" floating>+{{ item.friendHas }}</q-badge>
            </div>
          </div>

          <!-- Figuritas que yo tengo repetidas y él le faltan -->
          <div class="text-subtitle2 text-weight-bold q-mb-sm text-deep-orange">
            <q-icon name="arrow_upward" /> {{ t('exchange.youGive') }}
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

          <!-- ── Botón proponer intercambio ── -->
          <div class="q-mt-lg flex flex-center">
            <template v-if="alreadySentToFriend">
              <q-btn
                flat rounded
                color="grey"
                icon="check_circle"
                :label="t('common.loading')"
                disable
              />
            </template>
            <template v-else-if="theyCanGive.length > 0 || iCanGive.length > 0">
              <q-btn
                unelevated rounded
                color="primary"
                icon="handshake"
                label="{{ t('exchange.title') }}"
                @click="showProposeDialog = true"
              />
            </template>
          </div>
        </template>
      </q-card-section>
    </q-card>

    <!-- ── Mis propuestas enviadas ───────────────────────────────────── -->
    <q-card v-if="album.sentProposals.value.length > 0" flat bordered class="q-mt-lg">
      <q-card-section class="q-pb-sm">
        <div class="text-subtitle1 text-weight-bold">
          <q-icon name="send" color="primary" /> {{ t('exchange.title') }}
        </div>
      </q-card-section>
      <q-separator />
      <q-list separator>
        <q-item v-for="p in album.sentProposals.value" :key="p.id">
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white" size="38px">
              <span>{{ (p.toAlias || '?')[0].toUpperCase() }}</span>
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold">@{{ p.toAlias }}</q-item-label>
          <q-item-label caption>
              Doy {{ p.senderGives?.length ?? 0 }} · Recibo {{ p.receiverGives?.length ?? 0 }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge
              :color="statusColor(p.status)"
              :label="statusLabel(p.status)"
            />
            <q-btn
              v-if="p.status === 'pending'"
              flat dense round size="sm"
              icon="cancel"
              color="negative"
              class="q-mt-xs"
              :title="t('common.error')"
              @click="cancelProp(p.id)"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <!-- ── Dialog: Gestionar repetidas ──────────────────────────────── -->
    <q-dialog v-model="showEditRepeated" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card>
        <q-bar class="bg-deep-orange text-white q-py-md">
          <q-icon name="tune" />
          <div class="q-ml-sm text-weight-bold">{{ t('exchange.manageRepeated') }}</div>
          <q-space />
          <q-btn dense flat icon="close" color="white" v-close-popup />
        </q-bar>

        <q-card-section class="q-pb-sm">
          <q-btn
            unelevated rounded
            color="deep-orange"
            icon="filter_1"
            :label="t('exchange.resetAllToOne')"
            class="full-width"
            @click="resetAllToOne"
          />
        </q-card-section>

        <q-separator />

        <q-scroll-area style="height: calc(100dvh - 180px)">
          <q-list separator>
            <q-item v-for="item in myRepeated" :key="item.sticker.id" class="q-py-sm">
              <q-item-section avatar>
                <q-avatar
                  :style="{ backgroundColor: item.color }"
                  text-color="white"
                  size="40px"
                  font-size="12px"
                >
                  {{ item.sticker.localId || item.sticker.id }}
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ item.sticker.label }}</q-item-label>
                <q-item-label caption>
                  {{ item.sticker.sectionName }} · ×{{ item.count - 1 }} extra{{ item.count - 1 !== 1 ? 's' : '' }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="row items-center q-gutter-xs">
                  <q-btn
                    round flat dense
                    icon="remove"
                    size="sm"
                    color="negative"
                    :disable="item.count <= 1"
                    @click="decreaseSticker(item)"
                  />
                  <span class="text-weight-bold q-px-xs" style="min-width:28px; text-align:center">
                    {{ item.count }}
                  </span>
                  <q-btn
                    round flat dense
                    icon="add"
                    size="sm"
                    color="positive"
                    @click="increaseSticker(item)"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </q-card>
    </q-dialog>

    <!-- ── Dialog: Proponer intercambio ─────────────────────────────── -->
    <q-dialog v-model="showProposeDialog" persistent>
      <q-card style="min-width: 320px; max-width: 480px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6"><q-icon name="handshake" class="q-mr-sm" />{{ t('exchange.title') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="text-caption text-grey q-mb-md">
            Se le enviará una notificación a
            <strong>@{{ friendData?.alias }}</strong> para que se junten a intercambiar.
          </div>

          <div class="text-subtitle2 text-positive q-mb-xs">
            <q-icon name="arrow_downward" /> {{ t('exchange.gives') }} ({{ theyCanGive.length }} {{ t('exchange.stickers') }})
          </div>
          <div class="sticker-row q-mb-md">
            <q-badge
              v-for="item in theyCanGive.slice(0, 12)"
              :key="item.stickerId"
              color="positive"
              class="q-ma-xs"
              style="font-size:11px"
            >#{{ item.stickerId }}</q-badge>
            <span v-if="theyCanGive.length > 12" class="text-caption text-grey q-ml-xs">
              +{{ theyCanGive.length - 12 }} más
            </span>
          </div>

          <div class="text-subtitle2 text-deep-orange q-mb-xs">
            <q-icon name="arrow_upward" /> {{ t('exchange.youGive') }} ({{ iCanGive.length }} {{ t('exchange.stickers') }})
          </div>
          <div class="sticker-row q-mb-md">
            <q-badge
              v-for="item in iCanGive.slice(0, 12)"
              :key="item.sticker.id"
              color="deep-orange"
              class="q-ma-xs"
              style="font-size:11px"
            >#{{ item.sticker.id }}</q-badge>
            <span v-if="iCanGive.length > 12" class="text-caption text-grey q-ml-xs">
              +{{ iCanGive.length - 12 }} más
            </span>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            unelevated rounded
            color="primary"
            icon="send"
            label="Enviar propuesta"
            :loading="sendingProposal"
            @click="sendProposal"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { copyToClipboard, Notify } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
import { useLanguage } from 'src/composables/useLanguage'
import { useFirebaseAlbum } from 'src/composables/useFirebaseAlbum'
import { STICKERS_MAP, ALBUM_SECTIONS } from 'src/data/albumData'
import StickerCard from 'src/components/StickerCard.vue'

const authStore     = useAuthStore()
const album         = useFirebaseAlbum()
const { t }         = useLanguage()

const friendAlias   = ref('')
const friendData    = ref(null)
const loadingFriend = ref(false)

// Dialog de propuesta
const showProposeDialog = ref(false)
const sendingProposal   = ref(false)

// Dialog de gestión de repetidas
const showEditRepeated = ref(false)

// ── Mis repetidas ─────────────────────────────────────────────────────
const myRepeated = computed(() =>
  Object.entries(album.owned.value)
    .filter(([, v]) => v > 1)
    .map(([id, count]) => {
      const sticker = STICKERS_MAP[String(id)]
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
  if (!friendAlias.value.trim()) return
  loadingFriend.value = true
  friendData.value = null
  try {
    const data = await album.getFriendAlbumByAlias(friendAlias.value.trim())
    if (data) {
      friendData.value = data
    } else {
      Notify.create({ type: 'warning', message: t('common.error') })
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

// ¿Ya envié una propuesta pendiente a este amigo?
const alreadySentToFriend = computed(() => {
  if (!friendData.value?.uid) return false
  return album.sentProposals.value.some(
    p => p.toUid === friendData.value.uid && p.status === 'pending'
  )
})

// ── Enviar propuesta ──────────────────────────────────────────────────
async function sendProposal() {
  if (!friendData.value?.uid) return
  sendingProposal.value = true
  try {
    await album.sendExchangeProposal({
      toUid:         friendData.value.uid,
      toAlias:       friendData.value.alias || friendData.value.displayName,
      senderGives:   iCanGive.value.map(i => String(i.sticker.id)),
      receiverGives: theyCanGive.value.map(i => i.stickerId),
    })
    showProposeDialog.value = false
    Notify.create({ type: 'positive', message: t('exchange.proposalsAccepted'), icon: 'handshake' })
  } catch (err) {
    Notify.create({ type: 'negative', message: 'Error al enviar la propuesta' })
    console.error(err)
  } finally {
    sendingProposal.value = false
  }
}

// ── Cancelar propuesta enviada ────────────────────────────────────────
async function cancelProp(exchangeId) {
  try {
    await album.cancelProposal(exchangeId)
    Notify.create({ type: 'info', message: 'Propuesta cancelada' })
  } catch {
    Notify.create({ type: 'negative', message: 'Error al cancelar' })
  }
}

// ── Helpers de estado ─────────────────────────────────────────────────
function statusColor(status) {
  return { pending: 'amber', accepted: 'positive', rejected: 'negative', cancelled: 'grey' }[status] ?? 'grey'
}
function statusLabel(status) {
  const labels = { pending: 'Pendiente', accepted: 'Aceptada', rejected: 'Rechazada', cancelled: 'Cancelada' }
  return labels[status] ?? status
}

// ── Copiar Apodo ─────────────────────────────────────────────────────
function copyAlias() {
  copyToClipboard(album.alias?.value || '').then(() => {
    Notify.create({ type: 'positive', message: t('exchange.copy'), icon: 'content_copy' })
  })
}

// ── Editar Apodo ─────────────────────────────────────────────────────
function editarApodo() {
  const nuevoApodo = prompt('Ingresá tu nuevo apodo (mínimo 3 letras):', album.alias?.value || '')
  if (nuevoApodo && nuevoApodo.trim().length >= 3) {
    album.saveUserAlias(nuevoApodo.trim())
    Notify.create({ type: 'positive', message: t('common.success') })
  } else if (nuevoApodo !== null) {
    Notify.create({ type: 'negative', message: t('common.error') })
  }
}

// ── Gestión masiva de repetidas ───────────────────────────────────────
function decreaseSticker(item) {
  album.updateSticker({ stickerId: item.sticker.id, newCount: item.count - 1 })
}

function increaseSticker(item) {
  album.updateSticker({ stickerId: item.sticker.id, newCount: item.count + 1 })
}

function resetAllToOne() {
  myRepeated.value.forEach(item => {
    album.updateSticker({ stickerId: item.sticker.id, newCount: 1 })
  })
  Notify.create({ type: 'positive', message: t('exchange.resetAllDone'), icon: 'filter_1' })
  showEditRepeated.value = false
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
