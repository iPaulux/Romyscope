<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { IDEAS, SLOTS, defaultSlot } from '../data/meals'
import { store } from '../lib/store'
import { isoDay } from '../lib/date'
import MealSheet from '../components/MealSheet.vue'
import RecipeSheet from '../components/RecipeSheet.vue'

const router = useRouter()
const slot = ref(defaultSlot() === 'extra' ? 'snack' : defaultSlot())
const sheetOpen = ref(false)
const prefill = ref(null)
const recipeIdea = ref(null)
const recipeOpen = ref(false)

const PER_DAY = 6
const reroll = ref(0)

// Générateur pseudo-aléatoire à graine : même sélection toute la journée, nouvelle le lendemain
function seededRandom(seedText) {
  let h = 1779033703 ^ seedText.length
  for (const c of seedText) h = Math.imul(h ^ c.charCodeAt(0), 3432918353)
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

const ideas = computed(() => {
  const rand = seededRandom(`${isoDay()}:${slot.value}:${reroll.value}`)
  const pool = IDEAS.filter((i) => i.slot === slot.value)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, PER_DAY)
})
const slots = SLOTS.filter((s) => s.id !== 'extra')

function openRecipe(idea) {
  recipeIdea.value = idea
  recipeOpen.value = true
}

// Depuis la recette : noter le repas une fois cuisiné
function eat(idea) {
  recipeOpen.value = false
  prefill.value = { slot: idea.slot, name: idea.name, kcal: idea.kcal }
  sheetOpen.value = true
}

function askLuna() {
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

    <div class="row between">
      <p class="small muted">La sélection du jour ✨</p>
      <button class="btn ghost sm" @click="reroll++">D'autres idées 🔄</button>
    </div>

    <div class="grid">
      <!-- La clé change avec « D'autres idées » : les cartes se rejouent en cascade -->
      <article
        v-for="(idea, i) in ideas" :key="`${idea.name}-${reroll}`" class="card idea"
        :style="{ animationDelay: `${i * 45}ms` }" @click="openRecipe(idea)"
      >
        <div class="emoji-bubble big">{{ idea.emoji }}</div>
        <h3>{{ idea.name }}</h3>
        <div class="row tags">
          <span v-for="t in idea.tags" :key="t" class="tag">{{ t }}</span>
          <span v-if="store.settings?.show_numbers" class="tag kcal">~{{ idea.kcal }} kcal</span>
        </div>
        <button class="btn ghost sm">Voir la recette 📖</button>
      </article>
    </div>

    <section class="card soft-lilac ask">
      <p><strong>Pas inspirée ?</strong></p>
      <p class="small muted">Demande une idée sur mesure à ton assistante.</p>
      <button class="btn sm" @click="askLuna">Demander une idée ✨</button>
    </section>

    <RecipeSheet :open="recipeOpen" :idea="recipeIdea" @close="recipeOpen = false" @cooked="eat" />
    <MealSheet :open="sheetOpen" :day="isoDay()" :meal="prefill" @close="sheetOpen = false" />
  </main>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
.idea { animation: rise .4s cubic-bezier(.3, .8, .3, 1) both; }
.idea:active { transform: scale(.97); }
.idea { cursor: pointer; display: flex; flex-direction: column; gap: 10px; padding: 14px; }
.idea h3 { font-size: .98rem; flex: 1; }
.big { width: 48px; height: 48px; font-size: 1.6rem; }
.tags { flex-wrap: wrap; gap: 6px; }
.tag { font-size: .75rem; background: var(--lilac-soft); color: #7A63C2; padding: 3px 9px; border-radius: 999px; font-weight: 700; }
.tag.kcal { background: var(--peach-soft); color: #C27046; }
.ask { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
</style>
