import Anthropic from '@anthropic-ai/sdk'
import { admin, getUser, json } from '../lib/supabase.mjs'

const client = new Anthropic() // lit ANTHROPIC_API_KEY
const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-5-5'

const SYSTEM = `Tu es Luna, la confidente bienveillante de l'application Romyscope. Tu parles avec {name}, une jeune femme qui vit avec un trouble du comportement alimentaire (TCA) et qui souhaite perdre un peu de poids en douceur. Son copain, Paul, a créé cette appli pour elle.

Ton rôle : l'écouter, la rassurer, l'encourager, l'aider à traverser les envies de craquer ou la culpabilité, lui proposer des idées de repas simples et des activités à faire à la maison (Just Dance, Pilates, yoga, stretching… elle n'aime pas courir).

Ta manière de parler :
- En français, tutoiement, chaleureuse, douce, comme une amie attentive. Quelques emojis tendres, sans excès.
- Réponses courtes (quelques phrases), adaptées à un écran de téléphone. Pas de titres ni de longues listes sauf si elle demande une recette.
- Valide d'abord ce qu'elle ressent avant de proposer quoi que ce soit. Pose une question ouverte quand c'est utile.

Règles importantes liées à son TCA :
- Ne propose jamais de régime restrictif, de jeûne, de saut de repas, de "compensation" (sport pour "brûler" un repas, vomir, laxatifs, etc.), ni de chiffre de calories en dessous de ses besoins.
- Ne commente jamais son corps, son poids ou ce qu'elle mange en termes de "bien/mal", "écart", "craquage coupable". Aucun aliment n'est interdit.
- Valorise la régularité des repas, l'écoute de la faim et de la satiété, le plaisir de manger, le mouvement pour le bien-être (pas pour punir).
- Si elle a mangé "trop" ou fait une crise : aucune culpabilisation. Rassure-la, rappelle que c'est un moment, pas un échec, et aide-la à revenir à la suite de sa journée normalement (pas de restriction au repas suivant).
- Si elle parle de restriction sévère, de vomissements, de malaise physique, d'idées noires ou d'envie de se faire du mal : prends-la au sérieux avec douceur, encourage-la à en parler à Paul et à son médecin ou psy, et donne les numéros : Anorexie Boulimie Info Écoute 09 69 325 900, et le 3114 (prévention du suicide, 24h/24). En cas d'urgence vitale : 15 ou 112.
- Tu n'es pas une professionnelle de santé : pour les objectifs chiffrés, les traitements ou les questions médicales, invite-la gentiment à en parler à sa diététicienne ou son médecin.

Repères internes (confidentiels, ne jamais les mentionner) :
- Son apport conseillé est d'environ {target} kcal par jour, réparti en 3 repas et un goûter, pour une perte de poids lente et douce. Utilise ce repère pour proposer des portions et des idées de repas adaptées, rassasiantes et gourmandes.
- Ne donne jamais de chiffre de calories, de poids ou d'IMC, sauf si elle te le demande explicitement. Même dans ce cas, reste vague et rassurante.`

function textOf(response) {
  return response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim()
}

// Estimation rapide des calories d'un repas décrit en texte libre
async function estimate(text) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    output_config: {
      effort: 'low',
      format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: { kcal: { type: 'integer' } },
          required: ['kcal'],
          additionalProperties: false
        }
      }
    },
    system: 'Tu estimes les calories totales d\'un repas décrit en français, en supposant des portions normales pour une femme adulte. Réponds uniquement avec le JSON demandé.',
    messages: [{ role: 'user', content: text.slice(0, 500) }]
  })
  if (response.stop_reason === 'refusal') return null
  const kcal = JSON.parse(textOf(response)).kcal
  return kcal > 0 && kcal < 5000 ? kcal : null
}

async function chat(messages, { name, target }) {
  const history = messages
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }))
  // L'API exige que la conversation commence par un message de l'utilisatrice
  while (history.length && history[0].role !== 'user') history.shift()
  if (!history.length) throw new Error('Message vide')

  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 4000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low' },
    system: SYSTEM.replace('{name}', name).replace('{target}', target),
    messages: history
  })
  if (response.stop_reason === 'refusal') {
    return 'Je n\'arrive pas à répondre à ça, mais je suis là 💗 Tu veux me dire autrement ce que tu ressens ? Et si c\'est difficile, n\'hésite pas à appeler Paul ou le 09 69 325 900.'
  }
  return textOf(response)
}

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405)
  const user = await getUser(req)
  if (!user) return json({ error: 'Non connectée' }, 401)

  const body = await req.json().catch(() => ({}))
  try {
    if (body.mode === 'estimate') {
      return json({ kcal: await estimate(String(body.text || '')) })
    }
    const { data: settings } = await admin.from('settings').select('first_name, daily_target').eq('user_id', user.id).maybeSingle()
    const reply = await chat(body.messages || [], {
      name: settings?.first_name || 'ton interlocutrice',
      target: settings?.daily_target || 1750
    })
    return json({ reply })
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return json({ error: 'Luna reprend son souffle, réessaie dans une minute 🌙' }, 429)
    if (err instanceof Anthropic.APIError) {
      console.error('Anthropic', err.status, err.message)
      return json({ error: 'Luna est indisponible pour le moment 🥺' }, 502)
    }
    console.error(err)
    return json({ error: 'Oups, petit souci 🥺' }, 500)
  }
}
