<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '../lib/supabase'
import { store, settingsReady } from '../lib/store'
import { isRestDay, previewWeek } from '../data/program'
import { isoDay, addDays, startOfWeek, formatLong, greeting } from '../lib/date'
import { SLOTS, FEELINGS } from '../data/meals'
import { randomEncouragement } from '../data/encouragements'
import Gauge from '../components/Gauge.vue'
import MealSheet from '../components/MealSheet.vue'

const today = isoDay()
const day = ref(today)
const meals = ref([])
const glasses = ref(0)
const activities = ref([])
const note = ref({ text: randomEncouragement(), fromPaul: false })
const sheetOpen = ref(false)
const editedMeal = ref(null)

const settings = computed(() => store.settings || {})
const total = computed(() => meals.value.reduce((sum, m) => sum + (m.kcal || 0), 0))
const isToday = computed(() => day.value === today)
const dayLabel = computed(() => (isToday.value ? 'Aujourd\'hui' : formatLong(day.value)))
const feelingEmoji = (id) => FEELINGS.find((f) => f.id === id)?.emoji

const mealsBySlot = computed(() =>
  SLOTS.map((s) => ({ ...s, items: meals.value.filter((m) => m.slot === s.id) })).filter((s) => s.items.length)
)

async function load() {
  await settingsReady
  const [m, w, a] = await Promise.all([
    supabase.from('meals').select('*').eq('day', day.value).order('created_at'),
    supabase.from('water').select('glasses').eq('day', day.value).maybeSingle(),
    supabase.from('activities').select('*').eq('day', day.value).order('time', { nullsFirst: false })
  ])
  meals.value = m.data || []
  glasses.value = w.data?.glasses || 0
  // Hors ligne : on montre quand même les séances prévues par le programme
  activities.value = a.error
    ? store.settings?.program_enabled ? previewWeek(startOfWeek(day.value), today).filter((x) => x.day === day.value) : []
    : a.data
}

async function loadNote() {
  const { data } = await supabase.from('love_notes').select('content')
  if (data?.length && Math.random() < 0.7) {
    note.value = { text: data[Math.floor(Math.random() * data.length)].content, fromPaul: true }
  }
}

async function setGlasses(n) {
  glasses.value = glasses.value === n ? n - 1 : n
  await supabase.from('water').upsert({ day: day.value, glasses: glasses.value })
}

async function toggleActivity(a) {
  if (a.preview) return
  a.done = !a.done
  await supabase.from('activities').update({ done: a.done }).eq('id', a.id)
}

function openAdd() {
  editedMeal.value = null
  sheetOpen.value = true
}
function openEdit(m) {
  editedMeal.value = m
  sheetOpen.value = true
}

watch(day, load)
onMounted(() => {
  load()
  loadNote()
})
</script>

<template>
  <main class="page">
    <header class="page-head">
      <div>
        <p class="sub">{{ formatLong(today) }}</p>
        <h1>{{ greeting() }} {{ settings.first_name }} 🌷</h1>
      </div>
    </header>

    <section class="card note" :class="note.fromPaul ? 'soft-rose' : 'soft-lilac'">
      <p class="small muted">{{ note.fromPaul ? 'Un mot doux de Paul 💌' : 'Petit rappel' }}</p>
      <p class="note-text">{{ note.text }}</p>
    </section>

    <section class="card">
      <div class="row between day-nav">
        <button class="icon-btn" aria-label="Jour précédent" @click="day = addDays(day, -1)">‹</button>
        <h2>{{ dayLabel }}</h2>
        <button class="icon-btn" aria-label="Jour suivant" :disabled="isToday" :style="{ opacity: isToday ? .3 : 1 }" @click="day = addDays(day, 1)">›</button>
      </div>
      <Gauge :value="total" :target="settings.daily_target || 1750" :show-numbers="settings.show_numbers" />
      <button class="btn block add" @click="openAdd">＋ J'ai mangé quelque chose</button>
    </section>

    <section class="card">
      <div class="card-head"><h3>Mes repas</h3></div>
      <p v-if="!meals.length" class="empty">Rien de noté pour l'instant.<br />Pas de pression, à ton rythme 🌸</p>
      <div v-for="s in mealsBySlot" :key="s.id" class="slot">
        <p class="slot-title small muted">{{ s.emoji }} {{ s.label }}</p>
        <button v-for="m in s.items" :key="m.id" class="meal" @click="openEdit(m)">
          <span class="meal-name">{{ m.name }}</span>
          <span v-if="m.feeling" class="feeling">{{ feelingEmoji(m.feeling) }}</span>
          <span v-if="settings.show_numbers && m.kcal" class="kcal small muted">{{ m.kcal }}</span>
        </button>
      </div>
    </section>

    <section class="card soft-sky">
      <div class="card-head">
        <h3>Hydratation 💧</h3>
        <span class="small muted">{{ glasses }} / {{ settings.water_goal || 8 }}</span>
      </div>
      <div class="glasses">
        <button
          v-for="n in settings.water_goal || 8" :key="n" class="glass" :class="{ full: n <= glasses }"
          :aria-label="`${n} verre${n > 1 ? 's' : ''}`" @click="setGlasses(n)"
        >
          <svg viewBox="0 0 24 30" width="26" height="32">
            <path d="M3 3h18l-2.2 23a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
            <path class="water" d="M5.2 12h13.6l-1.4 14.2a1.2 1.2 0 0 1-1.2 1H7.8a1.2 1.2 0 0 1-1.2-1z" />
          </svg>
        </button>
      </div>
    </section>

    <section class="card">
      <div class="card-head">
        <h3>Au programme</h3>
        <router-link to="/planning" class="small link">Planning ›</router-link>
      </div>
      <p v-if="!activities.length && isRestDay(day)" class="empty">Dimanche, c'est repos 🛋️<br />Ton corps récupère, et ça aussi, c'est progresser.</p>
      <p v-else-if="!activities.length" class="empty">Journée libre. Un peu de repos, c'est aussi prendre soin de soi 🛋️</p>
      <div class="list">
        <label v-for="a in activities" :key="a.id" class="list-item activity">
          <span class="emoji-bubble">{{ a.emoji }}</span>
          <span class="grow">
            <strong :class="{ done: a.done }">{{ a.title }}</strong>
            <span class="small muted"><template v-if="a.time"> · {{ a.time.slice(0, 5) }}</template><template v-if="a.duration_min"> · {{ a.duration_min }} min</template></span>
          </span>
          <input type="checkbox" class="check" :checked="a.done" @change="toggleActivity(a)" />
        </label>
      </div>
    </section>

    <MealSheet :open="sheetOpen" :day="day" :meal="editedMeal" @close="sheetOpen = false" @saved="load" />
  </main>
</template>

<style scoped>
.note-text { font-family: 'Fredoka', sans-serif; font-size: 1.1rem; margin-top: 4px; }
.day-nav { margin-bottom: 8px; }
.day-nav h2 { text-transform: capitalize; text-align: center; flex: 1; }
.add { margin-top: 16px; }
.slot + .slot { margin-top: 10px; }
.slot-title { font-weight: 700; margin-bottom: 4px; }
.meal {
  width: 100%; display: flex; align-items: center; gap: 8px; text-align: left;
  background: var(--bg); border: 0; border-radius: 14px; padding: 11px 14px; margin-bottom: 6px; cursor: pointer;
}
.meal-name { flex: 1; }
.glasses { display: flex; flex-wrap: wrap; gap: 6px; }
.glass { background: none; border: 0; padding: 4px; color: #8EB8DE; cursor: pointer; }
.glass .water { fill: transparent; transition: fill .25s; }
.glass.full .water { fill: #8EC5F2; }
.link { color: #C2577E; text-decoration: none; font-weight: 700; }
.activity { cursor: pointer; }
.grow { flex: 1; display: flex; flex-direction: column; }
.done { text-decoration: line-through; color: var(--muted); }
.check { width: 24px; height: 24px; accent-color: var(--rose); }
</style>
