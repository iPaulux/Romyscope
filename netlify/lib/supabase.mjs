import { createClient } from '@supabase/supabase-js'

// Client "admin" (clé service) : à n'utiliser que côté serveur
export const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

// Vérifie le jeton Supabase envoyé par le front et renvoie l'utilisateur
export async function getUser(req) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  const { data } = await admin.auth.getUser(token)
  return data?.user ?? null
}
