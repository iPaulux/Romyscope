import { addDays, startOfWeek } from '../lib/date.js'

// Programme sport de base : 3 Just Dance, 2 Pilates, 1 yoga/stretch, dimanche repos.
// Cardio et renfo alternent, et les séances changent d'une semaine à l'autre.
const JUST_DANCE = [
  'Just Dance avec Paul',
  'Just Dance avec Paul · playlist surprise',
  'Just Dance avec Paul · vos chansons préférées',
  'Just Dance avec Paul · battle en duo'
]
const PILATES = [
  'Pilates · abdos & posture',
  'Pilates · fessiers & jambes',
  'Pilates · full body doux',
  'Pilates · dos & mobilité',
  'Pilates · bras & épaules'
]
const GENTLE = [
  { title: 'Yoga doux', emoji: '🪷', duration_min: 25 },
  { title: 'Stretching & respiration', emoji: '🤸‍♀️', duration_min: 20 }
]

export const PROGRAM_SUMMARY = '3 💃 · 2 🧘‍♀️ · 1 🪷 · dimanche repos'

export function isRestDay(iso) {
  return new Date(iso + 'T12:00:00').getDay() === 0
}

function weekNumber(weekStart) {
  return Math.round(new Date(weekStart + 'T12:00:00').getTime() / (7 * 86400000))
}

export function buildWeek(weekStart) {
  const n = weekNumber(weekStart)
  const jd = (i) => ({ title: JUST_DANCE[(n * 3 + i) % JUST_DANCE.length], emoji: '💃', duration_min: 30, time: '18:30' })
  const pilates = (i) => ({ title: PILATES[(n * 2 + i) % PILATES.length], emoji: '🧘‍♀️', duration_min: 30, time: '18:30' })
  const week = [jd(0), pilates(0), jd(1), pilates(1), jd(2), { ...GENTLE[n % GENTLE.length], time: '10:30' }]
  return week.map((a, i) => ({ ...a, day: addDays(weekStart, i), program_key: `${weekStart}:${i}` }))
}

// Séances prévues, sans base de données (affichées hors ligne, en lecture seule)
export function previewWeek(weekStart, today) {
  return buildWeek(weekStart)
    .filter((a) => a.day >= today)
    .map((a) => ({ ...a, id: a.program_key, done: false, preview: true }))
}

// Pré-remplit des semaines (par défaut l'actuelle et la suivante), une seule fois chacune
// (si une séance est supprimée, elle ne revient pas). Marche côté appli et côté serveur.
export async function seedProgram(client, { userId, settings, today, weeks: wanted }) {
  if (!settings?.program_enabled) return false
  const seeded = settings.seeded_weeks || []
  const current = startOfWeek(today)
  const weeks = (wanted || [current, addDays(current, 7)]).filter((w) => w >= current && !seeded.includes(w))
  if (!weeks.length) return false

  const rows = weeks
    .flatMap(buildWeek)
    .filter((a) => a.day >= today)
    .map((a) => ({ ...a, user_id: userId }))
  if (rows.length) {
    const { error } = await client.from('activities').upsert(rows, { onConflict: 'user_id,program_key', ignoreDuplicates: true })
    if (error) throw error
  }
  const seededWeeks = [...seeded, ...weeks].sort().slice(-12)
  await client.from('settings').update({ seeded_weeks: seededWeeks }).eq('user_id', userId)
  settings.seeded_weeks = seededWeeks
  return true
}
