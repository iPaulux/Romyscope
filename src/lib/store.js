import { reactive } from 'vue'
import { supabase } from './supabase'
import { seedProgram } from '../data/program'
import { isoDay } from './date'

// Valeurs utilisées tant que les réglages ne sont pas chargés (ou hors ligne)
const DEFAULT_SETTINGS = {
  first_name: '',
  daily_target: 1750,
  show_numbers: false,
  water_goal: 8,
  program_enabled: true,
  reminders: []
}

// État partagé minimal : session + réglages
export const store = reactive({
  session: null,
  settings: null,
  get isAdmin() {
    const admin = import.meta.env.VITE_ADMIN_EMAIL
    return !!admin && this.session?.user?.email === admin
  }
})

// Les écrans attendent cette promesse avant de lire le planning (programme pré-rempli)
export let settingsReady = Promise.resolve()

export function loadSettings() {
  settingsReady = fetchSettings()
  return settingsReady
}

async function fetchSettings() {
  const userId = store.session.user.id
  store.settings ??= { ...DEFAULT_SETTINGS, user_id: userId }
  try {
    let { data } = await supabase.from('settings').select('*').eq('user_id', userId).maybeSingle()
    if (!data) {
      const res = await supabase.from('settings').insert({ user_id: userId }).select().single()
      data = res.data
    }
    if (data) {
      store.settings = data
      await seedProgram(supabase, { userId, settings: data, today: isoDay() })
    }
  } catch (err) {
    console.warn('Réglages non chargés', err)
  }
  return store.settings
}

export async function saveSettings(patch) {
  Object.assign(store.settings, patch)
  await supabase.from('settings').update({ ...patch, updated_at: new Date().toISOString() }).eq('user_id', store.session.user.id)
}
