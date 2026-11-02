<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '../lib/supabase'
import { store, settingsReady } from '../lib/store'
import { isRestDay, PROGRAM_SUMMARY, seedProgram, previewWeek } from '../data/program'
import { isoDay, addDays, startOfWeek, formatLong } from '../lib/date'
import { PRESETS } from '../data/activities'
import { toast } from '../lib/toast'
import BottomSheet from '../components/BottomSheet.vue'

const today = isoDay()
const selected = ref(today)
const weekStart = ref(startOfWeek(today))
const weekItems = ref([])
const offline = ref(false)
const sheetOpen = ref(false)
const form = ref({})

const days = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const iso = addDays(weekStart.value, i)
    const d = new Date(iso + 'T12:00:00')
    return {
      iso,
      short: d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''),
      num: d.getDate(),
      count: weekItems.value.filter((a) => a.day === iso).length
    }
  })
)
const dayItems = computed(() => weekItems.value.filter((a) => a.day === selected.value))
const monthLabel = computed(() =>
  new Date(selected.value + 'T12:00:00').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
)
const doneThisWeek = computed(() => weekItems.value.filter((a) => a.done).length)

async function load() {
  await settingsReady
  // Une semaine future consultée pour la première fois reçoit son programme
  await seedProgram(supabase, {
    userId: store.session.user.id,
    settings: store.settings,
    today,
    weeks: [weekStart.value]
  }).catch(() => {})
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .gte('day', weekStart.value)
    .lte('day', addDays(weekStart.value, 6))
    .order('time', { nullsFirst: true })
  offline.value = !!error
  weekItems.value = error
    ? store.settings?.program_enabled ? previewWeek(weekStart.value, today) : []
    : data
}

function shiftWeek(n) {
  weekStart.value = addDays(weekStart.value, n * 7)
  selected.value = weekStart.value
}

function openAdd() {
  form.value = { title: '', emoji: '✨', time: '18:00', duration_min: 30, repeat: 1 }
  sheetOpen.value = true
}

function pickPreset(p) {
  form.value.title = p.title
  form.value.emoji = p.emoji
  form.value.duration_min = p.duration
}

async function save() {
  if (!form.value.title.trim()) return toast('Donne un petit nom à l\'activité 🌸')
  const rows = Array.from({ length: form.value.repeat }, (_, i) => ({
    day: addDays(selected.value, i * 7),
    title: form.value.title.trim(),
    emoji: form.value.emoji,
    time: form.value.time || null,
    duration_min: form.value.duration_min || null
  }))
  const { error } = await supabase.from('activities').insert(rows)
  if (error) return toast('Oups, ça n\'a pas été enregistré')
  sheetOpen.value = false
  toast('Ajouté au planning ✨')
  load()
}

async function toggle(a) {
  if (a.preview) return toast('Hors ligne : tu pourras cocher dès que la connexion revient 🌙')
  a.done = !a.done
  await supabase.from('activities').update({ done: a.done }).eq('id', a.id)
  if (a.done) toast('Bravo ! Ton corps te dit merci 💃')
}

async function remove(a) {
  await supabase.from('activities').delete().eq('id', a.id)
  load()
}

watch(weekStart, load)
onMounted(load)
</script>

<template>
  <main class="page">
    <header class="page-head">
      <div>
        <p class="sub">{{ monthLabel }}</p>
        <h1>Mon planning 🗓️</h1>
      </div>
      <button class="icon-btn" aria-label="Ajouter une activité" @click="openAdd">＋</button>
    </header>

    <section class="card week">
      <div class="row between">
        <button class="icon-btn small-btn" aria-label="Semaine précédente" @click="shiftWeek(-1)">‹</button>
        <div class="days">
          <button
            v-for="d in days" :key="d.iso" class="day"
            :class="{ on: d.iso === selected, today: d.iso === today }" @click="selected = d.iso"
          >
            <span class="small">{{ d.short }}</span>
            <strong>{{ d.num }}</strong>
            <span class="dots"><i v-for="n in Math.min(d.count, 3)" :key="n" /></span>
          </button>
        </div>
        <button class="icon-btn small-btn" aria-label="Semaine suivante" @click="shiftWeek(1)">›</button>
      </div>
      <p v-if="store.settings?.program_enabled" class="small muted cheer">Programme : {{ PROGRAM_SUMMARY }}</p>
      <p v-if="offline" class="small offline">Hors ligne : aperçu du programme, rien n'est enregistré pour l'instant.</p>
      <p v-if="doneThisWeek" class="small muted cheer">{{ doneThisWeek }} activité{{ doneThisWeek > 1 ? 's' : '' }} faite{{ doneThisWeek > 1 ? 's' : '' }} cette semaine, fière de toi 🌟</p>
    </section>

    <section class="card">
      <div class="card-head"><h3 class="cap">{{ formatLong(selected) }}</h3></div>
      <p v-if="!dayItems.length && isRestDay(selected)" class="empty">Dimanche, c'est repos 🛋️<br />Ton corps récupère, et ça aussi, c'est progresser.</p>
      <p v-else-if="!dayItems.length" class="empty">Rien de prévu. Envie d'ajouter un petit Just Dance ? 💃</p>
      <div class="list">
        <div v-for="a in dayItems" :key="a.id" class="list-item">
          <span class="emoji-bubble">{{ a.emoji }}</span>
          <span class="grow" @click="toggle(a)">
            <strong :class="{ done: a.done }">{{ a.title }}</strong>
            <span class="small muted">
              <template v-if="a.time">{{ a.time.slice(0, 5) }}</template>
              <template v-if="a.duration_min"> · {{ a.duration_min }} min</template>
            </span>
          </span>
          <input type="checkbox" class="check" :checked="a.done" @change="toggle(a)" />
          <button v-if="!a.preview" class="btn plain" aria-label="Supprimer" @click="remove(a)">✕</button>
        </div>
      </div>
      <button class="btn ghost block add" @click="openAdd">＋ Ajouter une activité</button>
    </section>

    <BottomSheet :open="sheetOpen" title="Nouvelle activité" @close="sheetOpen = false">
      <div class="presets">
        <button v-for="p in PRESETS" :key="p.title" class="preset" :class="{ on: form.title === p.title }" @click="pickPreset(p)">
          <span>{{ p.emoji }}</span>
          <small>{{ p.title }}</small>
        </button>
      </div>
      <div class="field">
        <label for="act-title">Activité</label>
        <input id="act-title" v-model="form.title" class="input" placeholder="Ex : Pilates avec Lucie" />
      </div>
      <div class="row">
        <div class="field grow">
          <label for="act-time">Heure</label>
          <input id="act-time" v-model="form.time" type="time" class="input" />
        </div>
        <div class="field grow">
          <label for="act-dur">Durée (min)</label>
          <input id="act-dur" v-model.number="form.duration_min" type="number" inputmode="numeric" class="input" />
        </div>
      </div>
      <div class="field">
        <label>Répéter chaque semaine</label>
        <div class="chips">
          <button v-for="n in [1, 2, 4, 8]" :key="n" class="chip" :class="{ on: form.repeat === n }" @click="form.repeat = n">
            {{ n === 1 ? 'Une fois' : `${n} semaines` }}
          </button>
        </div>
      </div>
      <button class="btn block" @click="save">Ajouter au {{ formatLong(selected) }}</button>
    </BottomSheet>
  </main>
</template>

<style scoped>
.week { padding: 12px 8px; }
.small-btn { width: 30px; height: 30px; flex: none; background: transparent; }
.days { flex: 1; display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.day {
  border: 0; background: transparent; border-radius: 14px; padding: 8px 0; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 1px; text-transform: capitalize;
}
.day.today strong { color: #D9668F; }
.day.on { background: var(--grad); color: #fff; }
.day.on strong { color: #fff; }
.dots { display: flex; gap: 2px; height: 6px; }
.dots i { width: 5px; height: 5px; border-radius: 50%; background: var(--lilac); }
.day.on .dots i { background: #fff; }
.cheer { text-align: center; margin-top: 8px; }
.offline { text-align: center; margin-top: 8px; background: var(--lilac-soft); color: #7A63C2; border-radius: 12px; padding: 8px; }
.cap { text-transform: capitalize; }
.grow { flex: 1; display: flex; flex-direction: column; cursor: pointer; }
.done { text-decoration: line-through; color: var(--muted); }
.check { width: 24px; height: 24px; accent-color: var(--rose); }
.add { margin-top: 12px; }
.presets { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.preset {
  border: 1.5px solid var(--line); background: #fff; border-radius: 16px; padding: 10px 4px; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 1.4rem;
}
.preset small { font-size: .7rem; font-weight: 700; text-align: center; }
.preset.on { border-color: var(--rose); background: var(--rose-soft); }
</style>
