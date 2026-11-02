import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
  // Pas de nouvelles tentatives automatiques (jusqu'à ~9 s par requête) :
  // hors ligne, l'appli bascule tout de suite sur l'aperçu
  db: { retry: false }
})
