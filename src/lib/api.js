import { supabase } from './supabase'

// Appelle une fonction Netlify en lui passant le jeton de session Supabase
export async function callFunction(name, body) {
  const { data } = await supabase.auth.getSession()
  const res = await fetch(`/.netlify/functions/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.session?.access_token}`
    },
    body: JSON.stringify(body)
  })
  const json = await res.json().catch(() => ({}))
  // Réponse non JSON en 502/504 = la fonction a été coupée par Netlify (délai dépassé)
  if (!res.ok && !json.error && (res.status === 502 || res.status === 504)) {
    throw new Error('Luna met trop de temps à répondre, réessaie dans un instant 🌙')
  }
  if (!res.ok) throw new Error(json.error || 'Oups, petit souci de connexion')
  return json
}
