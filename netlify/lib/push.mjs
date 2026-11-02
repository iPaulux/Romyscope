import webpush from 'web-push'
import { admin } from './supabase.mjs'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
  process.env.VITE_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

export async function sendToUser(userId, payload) {
  const { data: subs } = await admin.from('push_subscriptions').select('*').eq('user_id', userId)
  let sent = 0
  for (const sub of subs || []) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      )
      sent++
    } catch (err) {
      // Abonnement expiré : on le supprime
      if (err.statusCode === 404 || err.statusCode === 410) {
        await admin.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
      } else {
        console.error('push error', err.statusCode, err.body)
      }
    }
  }
  return sent
}
