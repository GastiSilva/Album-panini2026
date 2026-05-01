<template>
  <!--
    StickerCard.vue
    ───────────────────────────────────────────────────
    Estados:
      count === 0  → FALTA    (gris, opaco)
      count === 1  → TENGO    (color, sin badge)
      count  >  1  → REPETIDA (color, badge con cantidad extra)

    Interacción:
      · Click       → cicla estado: falta → tengo → repetida+1 → falta
      · Long press  → resetea a "falta"
  -->
  <div
    class="sticker-card"
    :class="[stateClass, { 'sticker-card--readonly': readonly }]"
    :style="cardStyle"
    role="button"
    :aria-label="`Figurita ${sticker.id} – ${sticker.label} – ${stateLabel}`"
    :tabindex="readonly ? -1 : 0"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
    @mousedown="startLongPress"
    @mouseup="cancelLongPress"
    @mouseleave="cancelLongPress"
    @touchstart.passive="startLongPress"
    @touchend="cancelLongPress"
    @touchcancel="cancelLongPress"
  >
    <!-- ── Badge de repetidas ── -->
    <q-badge
      v-if="isRepeated"
      class="sticker-card__badge"
      color="negative"
      floating
      rounded
    >
      ×{{ count - 1 }}
    </q-badge>

    <!-- ── Tipo de figurita ── -->
    <div class="sticker-card__type-icon">
      <q-icon :name="typeIcon" size="18px" />
    </div>

    <!-- ── Número ── -->
    <div class="sticker-card__number">{{ sticker.id }}</div>

    <!-- ── Estado visual (check / estrella) ── -->
    <transition name="pop">
      <q-icon
        v-if="isOwned"
        class="sticker-card__check"
        :name="isRepeated ? 'star' : 'check_circle'"
        size="14px"
      />
    </transition>

    <!-- ── Tooltip con label ── -->
    <q-tooltip
      anchor="bottom middle"
      self="top middle"
      :delay="300"
      class="sticker-card__tooltip"
    >
      <strong>#{{ sticker.id }}</strong> {{ sticker.label }}<br />
      <span class="text-caption">{{ stateLabel }}</span>
    </q-tooltip>

    <!-- ── Ripple visual en click ── -->
    <q-ripple v-if="!readonly" color="white" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

// ─────────────────────────────────────────────
//  Props & Emits
// ─────────────────────────────────────────────
const props = defineProps({
  /** Objeto de figurita: { id, type, label } */
  sticker: {
    type: Object,
    required: true,
  },
  /**
   * Cantidad en posesión:
   *   0 = falta | 1 = tengo | 2+ = repetidas
   */
  count: {
    type: Number,
    default: 0,
  },
  /** Color base del equipo (para el borde cuando está owned) */
  teamColor: {
    type: String,
    default: '#1565C0',
  },
  /** Modo solo lectura (vista de amigos) */
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update'])

// ─────────────────────────────────────────────
//  Estado computado
// ─────────────────────────────────────────────
const isMissing  = computed(() => props.count === 0)
const isOwned    = computed(() => props.count >= 1)
const isRepeated = computed(() => props.count > 1)

const stateClass = computed(() => ({
  'sticker-card--missing':  isMissing.value,
  'sticker-card--owned':    isOwned.value && !isRepeated.value,
  'sticker-card--repeated': isRepeated.value,
}))

const stateLabel = computed(() => {
  if (isMissing.value)  return 'Falta'
  if (isRepeated.value) return `Repetida ×${props.count - 1}`
  return 'Tengo'
})

const typeIcon = computed(() => {
  const icons = { shield: 'shield', team: 'groups', player: 'person', special: 'star' }
  return icons[props.sticker.type] || 'image'
})

const cardStyle = computed(() => {
  if (!isOwned.value) return {}
  return { '--team-color': props.teamColor }
})

// ─────────────────────────────────────────────
//  Long-press (reset a falta)
// ─────────────────────────────────────────────
const LONG_PRESS_MS = 600
let longPressTimer = null
const isLongPress = ref(false)

function startLongPress() {
  if (props.readonly) return
  longPressTimer = setTimeout(() => {
    isLongPress.value = true
    emit('update', { stickerId: props.sticker.id, newCount: 0 })
  }, LONG_PRESS_MS)
}

function cancelLongPress() {
  clearTimeout(longPressTimer)
  longPressTimer = null
  // Se resetea después del click handler para no disparar ambos
  setTimeout(() => { isLongPress.value = false }, 50)
}

// ─────────────────────────────────────────────
//  Click → ciclar estado
// ─────────────────────────────────────────────
function handleClick() {
  if (props.readonly || isLongPress.value) return

  let newCount
  if (props.count === 0) {
    newCount = 1          // falta → tengo
  } else if (props.count >= 10) {
    newCount = 0          // límite: reset tras 10 repetidas
  } else {
    newCount = props.count + 1  // tengo → repetida(n)
  }

  emit('update', { stickerId: props.sticker.id, newCount })
}
</script>

<style lang="scss" scoped>
// ─── Tokens ────────────────────────────────────────────────────────────
$card-size-sm:   44px;
$card-size-md:   52px;
$radius:         8px;
$trans:          all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

// ─── Base ───────────────────────────────────────────────────────────────
.sticker-card {
  position:       relative;
  display:        flex;
  flex-direction: column;
  align-items:    center;
  justify-content: center;
  width:          $card-size-sm;
  height:         $card-size-sm;
  border-radius:  $radius;
  cursor:         pointer;
  user-select:    none;
  transition:     $trans;
  border:         2px solid transparent;
  overflow:       visible;

  @media (min-width: 400px) {
    width:  $card-size-md;
    height: $card-size-md;
  }

  &:focus-visible {
    outline: 2px solid var(--team-color, #1565C0);
    outline-offset: 2px;
  }

  // ── Número ──────────────────────────────────────
  &__number {
    font-size:   11px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.3px;
  }

  // ── Tipo de figurita ─────────────────────────────
  &__type-icon {
    opacity: 0.5;
    margin-bottom: 2px;
    line-height: 1;
  }

  // ── Icono check/star ─────────────────────────────
  &__check {
    position: absolute;
    bottom:   2px;
    right:    2px;
  }

  // ── Badge de repetidas ────────────────────────────
  &__badge {
    top:   -6px !important;
    right: -6px !important;
    font-size: 9px !important;
    font-weight: 800;
    min-width: 18px;
  }

  // ── Tooltip ───────────────────────────────────────
  &__tooltip {
    font-size: 12px;
    max-width: 160px;
    text-align: center;
  }

  // ── Read-only ─────────────────────────────────────
  &--readonly {
    cursor: default;
    pointer-events: none;
  }

  // ─────────────────────────────────────────────────
  //  ESTADOS
  // ─────────────────────────────────────────────────

  // FALTA – gris apagado
  &--missing {
    background: rgba(0, 0, 0, 0.06);
    border-color: rgba(0, 0, 0, 0.1);
    color: rgba(0, 0, 0, 0.3);

    .body--dark & {
      background:   rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.1);
      color:        rgba(255, 255, 255, 0.25);
    }

    &:hover {
      background:   rgba(0, 0, 0, 0.1);
      border-color: rgba(0, 0, 0, 0.2);
      transform:    scale(1.06);
    }
  }

  // TENGO – color con borde del equipo
  &--owned {
    background:   color-mix(in srgb, var(--team-color, #1565C0) 15%, white);
    border-color: var(--team-color, #1565C0);
    color:        var(--team-color, #1565C0);
    box-shadow:   0 2px 8px rgba(0, 0, 0, 0.12);
    transform:    scale(1.03);

    .body--dark & {
      background: color-mix(in srgb, var(--team-color, #1565C0) 30%, #1e1e2e);
      color: white;
    }

    &:hover { transform: scale(1.1); }
  }

  // REPETIDA – amarillo/naranja vibrante
  &--repeated {
    background:   linear-gradient(135deg, #FF6F00 0%, #FFD600 100%);
    border-color: #FF6F00;
    color:        white;
    box-shadow:   0 3px 10px rgba(255, 111, 0, 0.4);
    transform:    scale(1.05);

    .sticker-card__type-icon { opacity: 0.9; }

    &:hover { transform: scale(1.13); }
  }
}

// ─── Animación pop al aparecer el check ─────────────────────────────────
.pop-enter-active  { animation: pop-in  0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.pop-leave-active  { animation: pop-out 0.15s ease-in; }

@keyframes pop-in  { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes pop-out { from { transform: scale(1); opacity: 1; } to { transform: scale(0); opacity: 0; } }
</style>
