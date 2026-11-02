import { admin } from '../lib/supabase.mjs'
import { sendToUser } from '../lib/push.mjs'
import { randomEncouragement } from '../../src/data/encouragements.js'
import { seedProgram } from '../../src/data/program.js'

// Tourne toutes les 15 minutes et envoie les rappels dont l'heure tombe dans le créneau en cours
export const config = { schedule: '*/15 * * * *' }

const TZ = 'Europe/Paris'
const pick = (list) => list[Math.floor(Math.random() * list.length)]

const MEAL_MESSAGES = {
  breakfast: ['Un petit-déj pour bien démarrer ? ☀️', 'Ton corps a besoin d\'énergie ce matin, prends le temps 🥐'],
  lunch: ['C\'est l\'heure de déjeuner ! Fais une vraie pause 🍝', 'Midi ! Prends soin de toi avec un bon repas 🌸'],
  snack: ['Petit goûter ? Tu le mérites 🍓', 'Une pause gourmande, c\'est aussi du soin 🍫'],
  dinner: ['C\'est l\'heure du dîner, installe-toi tranquillement 🍲', 'Bon appétit pour ce soir 💗']
}

function parisNow() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value])
  )
  return { day: `${parts.year}-${parts.month}-${parts.day}`, minutes: +parts.hour * 60 + +parts.minute }
}

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

// Un mot doux n'est jamais envoyé à son propre auteur
async function loveNotePayload(userId) {
  const { data: fresh } = await admin.from('love_notes').select('*').neq('author_id', userId).is('pushed_at', null).order('created_at').limit(1)
  let note = fresh?.[0]
  if (note) {
    await admin.from('love_notes').update({ pushed_at: new Date().toISOString() }).eq('id', note.id)
  } else {
    const { data: all } = await admin.from('love_notes').select('content').neq('author_id', userId)
    note = all?.length ? pick(all) : null
  }
  return note
    ? { title: 'Un mot doux de Paul 💌', body: note.content, tag: 'love' }
    : { title: 'Avant de dormir 🌙', body: randomEncouragement(), tag: 'love' }
}

async function payloadFor(reminder, userId) {
  switch (reminder.kind) {
    case 'meal':
      return { title: reminder.label, body: pick(MEAL_MESSAGES[reminder.id] || MEAL_MESSAGES.lunch), tag: reminder.id }
    case 'water':
      return { title: 'Hydratation 💧', body: 'Un petit verre d\'eau ? Ton corps te remercie', tag: 'water' }
    case 'love':
      return loveNotePayload(userId)
    default:
      return { title: 'Petit mot 🌷', body: randomEncouragement(), tag: 'courage' }
  }
}

export default async () => {
  const { day, minutes } = parisNow()
  const slotStart = Math.floor(minutes / 15) * 15
  const inSlot = (hhmm) => {
    const m = toMinutes(hhmm)
    return m >= slotStart && m < slotStart + 15
  }

  const { data: users } = await admin.from('push_subscriptions').select('user_id')
  const userIds = [...new Set((users || []).map((u) => u.user_id))]

  for (const userId of userIds) {
    const { data: settings } = await admin.from('settings').select('reminders, program_enabled, seeded_weeks').eq('user_id', userId).maybeSingle()
    // Pré-remplit le programme sport même si l'appli n'a pas été ouverte (pour que les rappels partent)
    await seedProgram(admin, { userId, settings, today: day }).catch((err) => console.error('seed', err))
    for (const r of settings?.reminders || []) {
      if (r.enabled && inSlot(r.time)) await sendToUser(userId, { ...(await payloadFor(r, userId)), url: '/' })
    }

    const { data: acts } = await admin.from('activities').select('*').eq('user_id', userId).eq('day', day).eq('done', false).not('time', 'is', null)
    for (const a of acts || []) {
      if (inSlot(a.time.slice(0, 5))) {
        await sendToUser(userId, {
          title: `${a.emoji} ${a.title}`,
          body: 'C\'est le moment ! Amuse-toi bien, tu vas être fière de toi ✨',
          tag: `act-${a.id}`,
          url: '/planning'
        })
      }
    }
  }
}
