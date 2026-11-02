import { getUser, json } from '../lib/supabase.mjs'
import { sendToUser } from '../lib/push.mjs'

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405)
  const user = await getUser(req)
  if (!user) return json({ error: 'Non connectée' }, 401)
  const sent = await sendToUser(user.id, { title: 'Coucou 💌', body: 'Les notifications marchent, tout est prêt !', tag: 'test' })
  if (!sent) return json({ error: 'Aucun appareil abonné, réactive les notifications' }, 400)
  return json({ sent })
}
