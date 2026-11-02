<script setup>
import { computed } from 'vue'

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
</script>

<template>
  <div class="gauge">
    <svg viewBox="0 0 180 180" width="180" height="180">
      <defs>
        <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#F7A8C0" />
          <stop offset="1" stop-color="#B39DEB" />
        </linearGradient>
      </defs>
      <circle cx="90" cy="90" :r="R" fill="none" stroke="#F7E9EE" stroke-width="16" />
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
        <div class="emoji">{{ label.emoji }}</div>
      </template>
    </div>
    <p class="label title">{{ label.text }}</p>
  </div>
</template>

<style scoped>
.gauge { position: relative; display: flex; flex-direction: column; align-items: center; }
.center { position: absolute; top: 0; height: 180px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.big { font-family: 'Fredoka', sans-serif; font-size: 2.2rem; font-weight: 600; line-height: 1; }
.emoji { font-size: 3rem; }
.label { margin-top: 6px; font-size: 1.1rem; }
</style>
