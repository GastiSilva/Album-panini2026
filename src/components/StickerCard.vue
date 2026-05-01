<template>
  <div
    class="sticker-card"
    :class="cardClass"
    @click="handleClick"
    @contextmenu.prevent="handleLongPress"
    :title="sticker.desc"
    role="button"
    :aria-label="`Figurita ${sticker.label} - ${stateLabel}`"
    tabindex="0"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- Badge for repeated count -->
    <q-badge
      v-if="isRepetida"
      class="sticker-badge"
      :label="`×${repeatCount}`"
      color="orange-9"
      floating
    />

    <!-- Sticker number -->
    <div class="sticker-number">{{ sticker.label }}</div>

    <!-- State icon -->
    <div class="sticker-icon">
      <q-icon
        v-if="isTengo"
        name="check_circle"
        color="white"
        size="18px"
      />
      <q-icon
        v-else-if="isRepetida"
        name="star"
        color="orange-4"
        size="18px"
      />
      <q-icon
        v-else
        name="add_circle_outline"
        color="grey-6"
        size="18px"
      />
    </div>

    <!-- Loading ripple while saving -->
    <q-inner-loading :showing="saving" size="xs" color="white" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { STATE_FALTA, STATE_TENGO, STATE_REPETIDA } from 'src/composables/useFirebaseAlbum.js'

// ─── Props ────────────────────────────────────────────────────────────────────
const props = defineProps({
  /** Full sticker object from albumData.js */
  sticker: {
    type: Object,
    required: true
  },
  /** Current state: 0 = falta, 1 = tengo, 2+ = repetida */
  state: {
    type: Number,
    default: 0
  },
  /** Show saving spinner */
  saving: {
    type: Boolean,
    default: false
  }
})

// ─── Emits ────────────────────────────────────────────────────────────────────
const emit = defineEmits(['cycle'])

// ─── Computed ─────────────────────────────────────────────────────────────────
const isFalta    = computed(() => props.state === STATE_FALTA)
const isTengo    = computed(() => props.state === STATE_TENGO)
const isRepetida = computed(() => props.state >= STATE_REPETIDA)
const repeatCount = computed(() => isRepetida.value ? props.state - 1 : 0)

const stateLabel = computed(() => {
  if (isFalta.value)    return 'Falta'
  if (isTengo.value)    return 'Tengo'
  return `Repetida ×${repeatCount.value}`
})

const cardClass = computed(() => ({
  'sticker-falta':    isFalta.value,
  'sticker-tengo':    isTengo.value,
  'sticker-repetida': isRepetida.value
}))

// ─── Handlers ─────────────────────────────────────────────────────────────────
function handleClick () {
  emit('cycle', props.sticker.id)
}

function handleLongPress () {
  emit('cycle', props.sticker.id)
}
</script>

<style scoped lang="scss">
.sticker-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 3 / 4;
  min-width: 56px;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
  border: 2px solid transparent;
  gap: 2px;

  &:hover {
    transform: scale(1.07);
  }

  &:active {
    transform: scale(0.95);
  }

  // ─── Falta (missing) ──────────────────────────────────────────────────────
  &.sticker-falta {
    background: linear-gradient(145deg, #2a2a4a, #1a1a30);
    border-color: #3a3a5a;
    opacity: 0.7;

    .sticker-number {
      color: #6a6a8a;
    }
  }

  // ─── Tengo (have) ─────────────────────────────────────────────────────────
  &.sticker-tengo {
    background: linear-gradient(145deg, #1b5e20, #2e7d32);
    border-color: #43a047;
    box-shadow: 0 2px 8px rgba(67, 160, 71, 0.4);
    opacity: 1;

    .sticker-number {
      color: #c8e6c9;
    }
  }

  // ─── Repetida (repeated) ──────────────────────────────────────────────────
  &.sticker-repetida {
    background: linear-gradient(145deg, #e65100, #bf360c);
    border-color: #ff6d00;
    box-shadow: 0 2px 8px rgba(255, 109, 0, 0.4);
    opacity: 1;

    .sticker-number {
      color: #ffe0b2;
    }
  }
}

.sticker-number {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-align: center;
  line-height: 1.2;
  padding: 0 2px;
}

.sticker-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.sticker-badge {
  font-size: 9px !important;
  padding: 1px 3px !important;
  min-width: 18px;
  top: 2px !important;
  right: 2px !important;
}

@media (min-width: 600px) {
  .sticker-number {
    font-size: 11px;
  }
}
</style>
