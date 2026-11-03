import { supabase } from './supabase'

async function post(url, body) {
  const { data } = await supabase.auth.getSession()
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.session?.access_token}`
    },
    body: JSON.stringify(body)
  })
}

async function errorFrom(res) {
  const json = await res.json().catch(() => ({}))
  if (json.error) return new Error(json.error)
  // Réponse non JSON en 502/504 = coupée par Netlify (délai dépassé)
  if (res.status === 502 || res.status === 504) return new Error('Luna met trop de temps à répondre, réessaie dans un instant 🌙')
  return new Error('Oups, petit souci de connexion')
}

// Appelle une fonction Netlify classique (ex : notification test)
export async function callFunction(name, body) {
  const res = await post(`/.netlify/functions/${name}`, body)
  if (!res.ok) throw await errorFrom(res)
  return res.json()
}

// Luna (Edge Function) : estimation des calories et recettes, réponse JSON
export async function callLuna(body) {
  const res = await post('/api/luna', body)
  if (!res.ok) throw await errorFrom(res)
  return res.json()
}

// Luna (Edge Function) : réponse du chat reçue au fur et à mesure
export async function streamLuna(messages, onText) {
  const res = await post('/api/luna', { messages })
  if (!res.ok || !res.headers.get('content-type')?.startsWith('text/plain')) throw await errorFrom(res)
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    onText(decoder.decode(value, { stream: true }))
  }
}
