// Dates au format YYYY-MM-DD, en heure locale
export function isoDay(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(iso, n) {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return isoDay(d)
}

export function startOfWeek(iso) {
  const d = new Date(iso + 'T12:00:00')
  const offset = (d.getDay() + 6) % 7 // lundi = 0
  return addDays(iso, -offset)
}

export function formatLong(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function greeting() {
  const h = new Date().getHours()
  if (h < 5) return 'Douce nuit'
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Coucou'
  return 'Bonsoir'
}
