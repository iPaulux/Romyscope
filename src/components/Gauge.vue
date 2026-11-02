<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  value: { type: Number, default: 0 },
  target: { type: Number, default: 1750 },
  showNumbers: { type: Boolean, default: false }
})

const R = 70
const C = 2 * Math.PI * R
const ratio = computed(() => Math.min(props.value / props.target, 1))
const offset = computed(() => C * (1 - ratio.value))

// Toujours positif, jamais de reproche, même au-delà de l'objectif
const label = computed(() => {
  const r = props.value / props.target
  if (r === 0) return { emoji: '🌅', text: 'La journée commence' }
  if (r < 0.35) return { emoji: '✨', text: 'C\'est parti' }
  if (r < 0.7) return { emoji: '🌸', text: 'Belle avancée' }
  if (r < 0.95) return { emoji: '💗', text: 'Presque complète' }
  return { emoji: '🫶', text: 'Journée bien nourrie' }
})

// Petite pluie de cœurs quand la jauge se remplit (seulement au moment où elle se remplit)
const celebrate = ref(false)
const HEARTS = [
  { x: -70, y: -60, d: 0 }, { x: 70, y: -55, d: 0.08 }, { x: -40, y: -95, d: 0.16 },
  { x: 45, y: -100, d: 0.04 }, { x: 0, y: -115, d: 0.12 }, { x: -85, y: -20, d: 0.2 }, { x: 85, y: -15, d: 0.1 }
]
watch(
  () => props.value / props.target >= 0.95,
  (full, wasFull) => {
    if (full && wasFull === false) {
      celebrate.value = true
      setTimeout(() => (celebrate.value = false), 1800)
    }
  }
)
</script>

<template>
  <div class="gauge">
    <svg viewBox="0 0 180 180" width="180" height="180">
      <defs>
        <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#F3B9F2" />
          <stop offset="1" stop-color="#C966CC" />
        </linearGradient>
      </defs>
      <circle cx="90" cy="90" :r="R" fill="none" stroke="#F6E6F6" stroke-width="16" />
      <circle
        cx="90" cy="90" :r="R" fill="none" stroke="url(#gauge-grad)" stroke-width="16" stroke-linecap="round"
        :stroke-dasharray="C" :stroke-dashoffset="offset" transform="rotate(-90 90 90)"
        style="transition: stroke-dashoffset .8s cubic-bezier(.3,.8,.3,1)"
      />
    </svg>
    <div class="center">
      <template v-if="showNumbers">
        <div class="big">{{ value }}</div>
        <div class="muted small">/ {{ target }} kcal</div>
      </template>
      <template v-else>
        <div :key="label.emoji" class="emoji">{{ label.emoji }}</div>
      </template>
    </div>
    <div v-if="celebrate" class="hearts" aria-hidden="true">
      <span v-for="(h, i) in HEARTS" :key="i" :style="{ '--x': `${h.x}px`, '--y': `${h.y}px`, animationDelay: `${h.d}s` }">💗</span>
    </div>
    <p :key="label.text" class="label title">{{ label.text }}</p>
  </div>
</template>

<style scoped>
.gauge { position: relative; display: flex; flex-direction: column; align-items: center; }
.center { position: absolute; top: 0; height: 180px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.big { font-family: 'Fredoka', sans-serif; font-size: 2.2rem; font-weight: 600; line-height: 1; }
.emoji { font-size: 3rem; animation: pop .45s ease; }
.label { margin-top: 6px; font-size: 1.1rem; animation: rise .4s ease both; }
.hearts { position: absolute; top: 90px; left: 50%; pointer-events: none; }
.hearts span {
  position: absolute; font-size: 1.3rem; opacity: 0;
  animation: heart-fly 1.4s ease-out forwards;
}
@keyframes heart-fly {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(.4); }
  20% { opacity: 1; }
  100% { opacity: 0; transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(1.1); }
}
</style>
