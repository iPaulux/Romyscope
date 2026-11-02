import { GoogleGenAI, ApiError, ThinkingLevel } from '@google/genai'
import { getUser, json } from '../lib/supabase.mjs'
import { env } from '../lib/env.mjs'

const ai = new GoogleGenAI({ apiKey: env('GEMINI_API_KEY') })
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash'
// Netlify coupe les fonctions à 10 s : on abandonne avant pour renvoyer un message propre
const TIMEOUT_MS = 8500

// Offre gratuite de Gemini : Google peut réutiliser les conversations.
// On n'envoie donc que les messages du chat : ni prénom, ni objectif, ni données de suivi.
const SYSTEM = `Tu es Luna, la confidente bienveillante de l'application Romyscope. Tu parles avec une jeune femme qui vit avec un trouble du comportement alimentaire (TCA) et qui souhaite perdre un peu de poids en douceur. Son copain, Paul, a créé cette appli pour elle.

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
- Elle vise une perte de poids lente et douce, avec 3 repas et un goûter par jour. Utilise ce repère pour proposer des portions et des idées de repas adaptées, rassasiantes et gourmandes.
- Ne donne jamais de chiffre de calories, de poids ou d'IMC, sauf si elle te le demande explicitement. Même dans ce cas, reste vague et rassurante.`

const FALLBACK_REPLY = 'Je n\'arrive pas à répondre à ça, mais je suis là 💗 Tu veux me dire autrement ce que tu ressens ? Et si c\'est difficile, n\'hésite pas à appeler Paul ou le 09 69 325 900.'

// Estimation rapide des calories d'un repas décrit en texte libre
async function estimate(text) {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: text.slice(0, 500),
    config: {
      systemInstruction: 'Tu estimes les calories totales d\'un repas décrit en français, en supposant des portions normales pour une femme adulte. Réponds uniquement avec le JSON demandé.',
      thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
      abortSignal: AbortSignal.timeout(TIMEOUT_MS),
      responseMimeType: 'application/json',
      responseJsonSchema: {
        type: 'object',
        properties: { kcal: { type: 'integer' } },
        required: ['kcal']
      }
    }
  })
  if (!response.text) return null
  const kcal = JSON.parse(response.text).kcal
  return kcal > 0 && kcal < 5000 ? kcal : null
}

async function chat(messages) {
  const history = messages
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-20)
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content.slice(0, 4000) }] }))
    // Fusionne les messages consécutifs du même rôle (ex : un envoi précédent qui a échoué)
    .reduce((acc, m) => {
      const last = acc[acc.length - 1]
      if (last?.role === m.role) last.parts.push(...m.parts)
      else acc.push(m)
      return acc
    }, [])
  // La conversation doit commencer par un message de l'utilisatrice
  while (history.length && history[0].role !== 'user') history.shift()
  if (!history.length) throw new Error('Message vide')

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: history,
    config: {
      systemInstruction: SYSTEM,
      // Réflexion courte : une réponse de confidente n'a pas besoin de longue réflexion, et ça tient dans le délai
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      maxOutputTokens: 2048,
      abortSignal: AbortSignal.timeout(TIMEOUT_MS)
    }
  })
  // Réponse vide = bloquée par les filtres de sécurité de Gemini
  return response.text?.trim() || FALLBACK_REPLY
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
    return json({ reply: await chat(body.messages || []) })
  } catch (err) {
    if (err?.name === 'AbortError' || err?.name === 'TimeoutError') {
      console.error('Gemini : délai dépassé')
      return json({ error: 'Luna réfléchit trop longtemps, réessaie dans un instant 🌙' }, 504)
    }
    if (err instanceof ApiError && err.status === 429) {
      return json({ error: 'Luna reprend son souffle, réessaie dans une minute 🌙' }, 429)
    }
    if (err instanceof ApiError && err.message.includes('API_KEY_INVALID')) {
      console.error('Gemini : clé API invalide')
      return json({ error: 'Luna est indisponible : la clé Gemini est invalide (à vérifier sur Netlify) 🥺' }, 502)
    }
    if (err instanceof ApiError) {
      console.error('Gemini', err.status, err.message)
      // Le code d'erreur (sans détail sensible) aide à diagnostiquer : 400/403 = clé, 404 = modèle
      return json({ error: `Luna est indisponible pour le moment 🥺 (erreur ${err.status})` }, 502)
    }
    console.error(err)
    return json({ error: 'Oups, petit souci 🥺' }, 500)
  }
}
