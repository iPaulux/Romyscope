<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { store, saveSettings } from '../lib/store'
import { pushSupported, isStandalone, currentSubscription, enablePush, disablePush } from '../lib/push'
import { callFunction } from '../lib/api'
import { isoDay, addDays } from '../lib/date'
import { FEELINGS } from '../data/meals'
import { toast } from '../lib/toast'
import { seedProgram, PROGRAM_SUMMARY } from '../data/program'

const s = computed(() => store.settings)
const pushOn = ref(false)
const pushBusy = ref(false)
const weekFeelings = ref([])
const weekStats = ref({ meals: 0, activities: 0 })

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
const needsInstall = isIOS && !isStandalone()

const feelingCounts = computed(() =>
  FEELINGS.map((f) => ({ ...f, count: weekFeelings.value.filter((x) => x === f.id).length })).filter((f) => f.count)
)

async function loadWeek() {
  const from = addDays(isoDay(), -6)
  const [m, a] = await Promise.all([
    supabase.from('meals').select('feeling').gte('day', from),
    supabase.from('activities').select('id').gte('day', from).lte('day', isoDay()).eq('done', true)
  ])
  weekFeelings.value = (m.data || []).map((x) => x.feeling).filter(Boolean)
  weekStats.value = { meals: m.data?.length || 0, activities: a.data?.length || 0 }
}

async function togglePush() {
  pushBusy.value = true
  try {
    if (pushOn.value) {
      await disablePush()
      pushOn.value = false
    } else {
      await enablePush()
      pushOn.value = true
      toast('Notifications activées 🔔')
    }
  } catch (e) {
    toast(e.message === 'Permission refusée' ? 'Autorise les notifications dans les réglages du téléphone' : 'Impossible d\'activer les notifications')
  } finally {
    pushBusy.value = false
  }
}

async function testPush() {
  try {
    await callFunction('push-test', {})
    toast('Notification envoyée, regarde ton écran 💌')
  } catch (e) {
    toast(e.message)
  }
}

function updateReminder(r, patch) {
  Object.assign(r, patch)
  saveSettings({ reminders: s.value.reminders })
}

async function toggleProgram(on) {
  await saveSettings({ program_enabled: on })
  if (on) await seedProgram(supabase, { userId: store.session.user.id, settings: s.value, today: isoDay() })
  toast(on ? 'Programme ajouté à ton planning 💃' : 'Programme en pause, prends soin de toi 🌙')
}

async function logout() {
  await supabase.auth.signOut()
}

onMounted(async () => {
  loadWeek()
  pushOn.value = !!(await currentSubscription())
})
</script>

<template>
  <main v-if="s" class="page">
    <header class="page-head">
      <div>
        <p class="sub">Mon espace</p>
        <h1>Moi 🌸</h1>
      </div>
    </header>

    <section class="card soft-peach">
      <div class="card-head"><h3>Ma semaine</h3></div>
      <div class="stats">
        <div><strong>{{ weekStats.meals }}</strong><span class="small muted">repas notés</span></div>
        <div><strong>{{ weekStats.activities }}</strong><span class="small muted">activités faites</span></div>
      </div>
      <div v-if="feelingCounts.length" class="feelings">
        <span v-for="f in feelingCounts" :key="f.id" class="feeling">{{ f.emoji }} <small>×{{ f.count }}</small></span>
      </div>
      <p class="small muted">Chaque repas noté est une victoire, peu importe ce qu'il y avait dans l'assiette 💗</p>
    </section>

    <section class="card stack">
      <h3>Objectif</h3>
      <div class="field">
        <label for="name">Prénom</label>
        <input id="name" class="input" :value="s.first_name" @change="saveSettings({ first_name: $event.target.value })" />
      </div>
      <!-- En mode doux, l'objectif chiffré reste caché : seule la jauge compte -->
      <div v-if="s.show_numbers" class="field">
        <div class="row between">
          <label for="target">Énergie du jour</label>
          <span class="small muted">{{ s.daily_target }} kcal</span>
        </div>
        <input
          id="target" type="range" min="1400" max="2800" step="50" :value="s.daily_target"
          @input="s.daily_target = +$event.target.value" @change="saveSettings({ daily_target: s.daily_target })"
        />
        <p class="small muted">Idéalement à définir avec ta diét' ou ton médecin. Le minimum est volontairement fixé à 1400 pour te protéger 🫶</p>
      </div>
      <p v-else class="small muted">Ta jauge est réglée en douceur pour toi. Pas besoin de penser aux chiffres 🌸</p>
      <label class="row between">
        <span>
          <strong>Afficher les chiffres</strong><br />
          <span class="small muted">Sinon, juste une jauge toute douce</span>
        </span>
        <span class="switch">
          <input type="checkbox" :checked="s.show_numbers" @change="saveSettings({ show_numbers: $event.target.checked })" />
          <span />
        </span>
      </label>
      <div class="field">
        <label>Verres d'eau par jour</label>
        <div class="chips">
          <button v-for="n in [6, 8, 10]" :key="n" class="chip" :class="{ on: s.water_goal === n }" @click="saveSettings({ water_goal: n })">{{ n }}</button>
        </div>
      </div>
    </section>

    <section class="card stack">
      <h3>Sport 💃</h3>
      <label class="row between">
        <span>
          <strong>Programme automatique</strong><br />
          <span class="small muted">{{ PROGRAM_SUMMARY }}. Ça change un peu chaque semaine.</span>
        </span>
        <span class="switch">
          <input type="checkbox" :checked="s.program_enabled" @change="toggleProgram($event.target.checked)" />
          <span />
        </span>
      </label>
      <p class="small muted">Une semaine sans ? Coupe-le : les séances déjà prévues restent, les suivantes ne sont plus ajoutées. Sauter une séance, c'est ok aussi 🫶</p>
    </section>

    <section class="card stack">
      <div class="row between">
        <h3>Notifications 🔔</h3>
        <span v-if="pushSupported() && !needsInstall" class="switch">
          <input type="checkbox" :checked="pushOn" :disabled="pushBusy" @change="togglePush" />
          <span />
        </span>
      </div>
      <p v-if="needsInstall" class="small hint">
        Sur iPhone, ajoute d'abord Romyscope à l'écran d'accueil : bouton Partager
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12M8 7l4-4 4 4M5 12v8h14v-8" /></svg>
        puis « Sur l'écran d'accueil ». Ouvre l'appli depuis là et reviens ici 🌷
      </p>
      <p v-else-if="!pushSupported()" class="small muted">Ton navigateur ne gère pas les notifications.</p>
      <template v-if="pushOn">
        <div class="list">
          <div v-for="r in s.reminders" :key="r.id" class="list-item">
            <input type="time" class="input time" :value="r.time" @change="updateReminder(r, { time: $event.target.value })" />
            <span class="grow">{{ r.label }}</span>
            <span class="switch">
              <input type="checkbox" :checked="r.enabled" @change="updateReminder(r, { enabled: $event.target.checked })" />
              <span />
            </span>
          </div>
        </div>
        <p class="small muted">Les activités de ton planning avec une heure t'envoient aussi un rappel.</p>
        <button class="btn ghost sm" @click="testPush">Envoyer une notif test</button>
      </template>
    </section>

    <router-link v-if="store.isAdmin" to="/mots-doux" class="card soft-rose row between admin">
      <span><strong>💌 Écrire des mots doux</strong><br /><span class="small muted">Réservé à Paul</span></span>
      <span>›</span>
    </router-link>

    <button class="btn plain" @click="logout">Se déconnecter</button>
  </main>
</template>

<style scoped>
.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
.stats div { background: rgba(255, 255, 255, .7); border-radius: 16px; padding: 12px; display: flex; flex-direction: column; }
.stats strong { font-family: 'Fredoka', sans-serif; font-size: 1.6rem; }
.feelings { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; font-size: 1.3rem; }
.feeling small { font-size: .8rem; color: var(--muted); }
input[type='range'] { width: 100%; accent-color: var(--rose); }
.hint { background: var(--lilac-soft); padding: 12px; border-radius: 14px; }
.time { width: 110px; padding: 8px 10px; }
.grow { flex: 1; }
.admin { text-decoration: none; color: inherit; }
</style>
