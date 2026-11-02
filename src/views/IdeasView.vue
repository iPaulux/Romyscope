<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { IDEAS, SLOTS, defaultSlot } from '../data/meals'
import { store } from '../lib/store'
import { isoDay } from '../lib/date'
import MealSheet from '../components/MealSheet.vue'

const router = useRouter()
const slot = ref(defaultSlot() === 'extra' ? 'snack' : defaultSlot())
const sheetOpen = ref(false)
const prefill = ref(null)

const ideas = computed(() => IDEAS.filter((i) => i.slot === slot.value))
const slots = SLOTS.filter((s) => s.id !== 'extra')

function eat(idea) {
  prefill.value = { slot: idea.slot, name: idea.name, kcal: idea.kcal }
  sheetOpen.value = true
}

function askClaude() {
  const label = SLOTS.find((s) => s.id === slot.value).label.toLowerCase()
  router.push({ path: '/chat', query: { q: `Tu peux me proposer une idée de ${label} simple, gourmande et équilibrée avec ce que j'ai probablement dans mes placards ?` } })
}
</script>

<template>
  <main class="page">
    <header class="page-head">
      <div>
        <p class="sub">Inspiration</p>
        <h1>Idées repas 🍽️</h1>
      </div>
    </header>

    <div class="chips scroll">
      <button v-for="s in slots" :key="s.id" class="chip" :class="{ on: slot === s.id }" @click="slot = s.id">
        {{ s.emoji }} {{ s.label }}
      </button>
    </div>

    <div class="grid">
      <article v-for="idea in ideas" :key="idea.name" class="card idea">
        <div class="emoji-bubble big">{{ idea.emoji }}</div>
        <h3>{{ idea.name }}</h3>
        <div class="row tags">
          <span v-for="t in idea.tags" :key="t" class="tag">{{ t }}</span>
          <span v-if="store.settings?.show_numbers" class="tag kcal">~{{ idea.kcal }} kcal</span>
        </div>
        <button class="btn ghost sm" @click="eat(idea)">Je mange ça</button>
      </article>
    </div>

    <section class="card soft-lilac ask">
      <p><strong>Pas inspirée ?</strong></p>
      <p class="small muted">Demande une idée sur mesure à ton assistante.</p>
      <button class="btn sm" @click="askClaude">Demander une idée ✨</button>
    </section>

    <MealSheet :open="sheetOpen" :day="isoDay()" :meal="prefill" @close="sheetOpen = false" />
  </main>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
.idea { display: flex; flex-direction: column; gap: 10px; padding: 14px; }
.idea h3 { font-size: .98rem; flex: 1; }
.big { width: 48px; height: 48px; font-size: 1.6rem; }
.tags { flex-wrap: wrap; gap: 6px; }
.tag { font-size: .75rem; background: var(--lilac-soft); color: #7A63C2; padding: 3px 9px; border-radius: 999px; font-weight: 700; }
.tag.kcal { background: var(--peach-soft); color: #C27046; }
.ask { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
</style>
