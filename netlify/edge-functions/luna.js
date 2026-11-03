// Luna : chat, estimation des calories et recettes, via l'API Gemini (offre gratuite).
// Edge Function plutôt que fonction classique : elle peut attendre jusqu'à 40 s (contre 10 s),
// ce qui laisse le temps de relancer Gemini quand ses modèles gratuits sont surchargés.

const env = (name) => (globalThis.Netlify?.env.get(name) ?? globalThis.process?.env?.[name] ?? '').trim()

// Modèles gratuits, du plus souvent rapide au moins rapide. Leur vitesse change d'un jour à l'autre
// (le 2026-11-03 : 13 s, 5,8 s et 0,8 s, avec beaucoup de 503), d'où les requêtes en parallèle et les relances.
const MODELS = ['gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.1-flash-lite']

// On garde de la marge sous la limite de 40 s des Edge Functions
const BUDGET_MS = 32000
// Sans réponse au bout de ce délai, on lance aussi le modèle suivant (sans couper le premier)
const HEDGE_MS = 1500
// Si tous les modèles sont surchargés, on attend un peu avant un nouveau tour
const ROUND_PAUSE_MS = 2000
const RETRYABLE = [404, 429, 500, 503]

// Offre gratuite de Gemini : Google peut réutiliser les contenus envoyés.
// On n'envoie donc que les messages du chat : ni prénom, ni objectif, ni données de suivi.
const SYSTEM = `Tu es Luna, la confidente bienveillante de l'application Romyscope. Tu parles avec une jeune femme qui vit avec un trouble du comportement alimentaire (TCA) et qui souhaite perdre un peu de poids en douceur. Son copain, Paul, a créé cette appli pour elle.

Ton rôle : l'écouter, la rassurer, l'encourager, l'aider à traverser les envies de craquer ou la culpabilité, lui proposer des idées de repas simples et des activités à faire à la maison (Just Dance, Pilates, yoga, stretching… elle n'aime pas courir).

Ils sont étudiants avec un petit budget : tes idées de repas utilisent des ingrédients basiques et pas chers (œufs, pâtes, riz, légumineuses, surgelés, conserves, fruits et légumes de saison), le batch cooking et les restes. Ne conseille jamais de produits chers, de compléments, d'abonnement, d'appli payante ni de matériel à acheter : pour le sport, propose des vidéos gratuites sur YouTube en donnant des mots-clés à chercher (ex : « pilates doux 20 min débutant »), jamais de noms de chaînes ou de vidéos précises, qui pourraient ne pas exister.

Ta manière de parler :
- En français, tutoiement, chaleureuse, douce, comme une amie attentive. Quelques emojis tendres, sans excès.
- Réponses courtes (quelques phrases), adaptées à un écran de téléphone. Pas de titres ni de longues listes sauf si elle demande une recette.
- Texte simple sans mise en forme Markdown : pas d'astérisques, de dièses ni de tirets de liste (l'appli les afficherait tels quels).
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

const ESTIMATE_SYSTEM = 'Tu estimes les calories totales d\'un repas décrit en français, en supposant des portions normales pour une femme adulte. Réponds uniquement avec le JSON demandé.'

const RECIPE_SYSTEM = `Tu écris des recettes simples et gourmandes pour une personne, en français, pour une étudiante avec un petit budget.
Ingrédients basiques et pas chers, trouvables dans n'importe quel supermarché en France (marques distributeur) : œufs, pâtes, riz, légumineuses, flocons d'avoine, légumes et fruits de saison, surgelés, conserves, fromage râpé, yaourts… Pas de produits chers ou rares (saumon, crevettes, avocat, fruits exotiques, quinoa, fromages chers, compléments). Si le plat en contient, propose une version économique équivalente. Matériel de base uniquement (poêle, casserole, four ou micro-ondes).
estimated_cost_eur : coût approximatif de la portion en euros, prix supermarché en France.
Quantités précises (grammes, ml, cuillères, pièces) pour UNE portion. 3 à 7 étapes courtes et claires, à la deuxième personne du singulier.
Ne mentionne jamais les calories, le poids ou le mot "régime". L'astuce est une petite idée bienveillante (variante, conservation, ou geste plaisir).`

const RECIPE_SCHEMA = {
  type: 'object',
  properties: {
    prep_minutes: { type: 'integer' },
    cook_minutes: { type: 'integer' },
    estimated_cost_eur: { type: 'number' },
    ingredients: {
      type: 'array',
      items: {
        type: 'object',
        properties: { item: { type: 'string' }, quantity: { type: 'string' } },
        required: ['item', 'quantity']
      }
    },
    steps: { type: 'array', items: { type: 'string' } },
    tip: { type: 'string' }
  },
  required: ['prep_minutes', 'cook_minutes', 'estimated_cost_eur', 'ingredients', 'steps', 'tip']
}

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

class GeminiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// Vérifie le jeton de session Supabase envoyé par l'appli
async function getUser(req) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  const res = await fetch(`${env('VITE_SUPABASE_URL')}/auth/v1/user`, {
    headers: { apikey: env('SUPABASE_SERVICE_ROLE_KEY'), Authorization: `Bearer ${token}` }
  })
  return res.ok ? res.json() : null
}

function callGemini(model, body, { stream, signal }) {
  const method = stream ? 'streamGenerateContent?alt=sse' : 'generateContent'
  return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env('GEMINI_API_KEY') },
    body: JSON.stringify(body),
    signal
  })
}

// Lance le premier modèle, puis les suivants en parallèle s'il tarde ou échoue, et refait des tours
// tant qu'il reste du temps. Renvoie la première réponse HTTP valide ; les autres requêtes sont annulées.
function firstAvailable(body, { stream = false, preferred } = {}) {
  const models = [...new Set([preferred, ...MODELS].filter(Boolean))]
  const inFlight = new Set() // AbortController de chaque requête en cours
  const timers = []
  let next = 0
  let settled = false

  return new Promise((resolve, reject) => {
    const finish = (fn, value, keep) => {
      if (settled) return
      settled = true
      timers.forEach(clearTimeout)
      for (const c of inFlight) if (c !== keep) c.abort()
      fn(value)
    }
    timers.push(setTimeout(() => finish(reject, new GeminiError(504, 'Délai dépassé')), BUDGET_MS))

    const launch = () => {
      if (settled) return
      if (next >= models.length) {
        // Tous les modèles ont été essayés : nouveau tour une fois qu'aucune requête n'est en cours
        if (inFlight.size === 0) {
          next = 0
          timers.push(setTimeout(launch, ROUND_PAUSE_MS))
        }
        return
      }
      const model = models[next++]
      const controller = new AbortController()
      inFlight.add(controller)
      timers.push(setTimeout(launch, HEDGE_MS))
      callGemini(model, body, { stream, signal: controller.signal })
        .then(async (res) => {
          if (res.ok) return finish(resolve, res, controller)
          inFlight.delete(controller)
          if (!RETRYABLE.includes(res.status)) {
            return finish(reject, new GeminiError(res.status, await res.text())) // ex : clé invalide
          }
          console.warn(`Gemini ${model} indisponible (${res.status})`)
          launch()
        })
        .catch(() => {
          inFlight.delete(controller)
          launch()
        })
    }
    launch()
  })
}

const textOf = (data) =>
  (data.candidates?.[0]?.content?.parts || [])
    .filter((p) => !p.thought)
    .map((p) => p.text || '')
    .join('')

async function generateJson({ system, prompt, schema, preferred }) {
  const res = await firstAvailable(
    {
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { thinkingConfig: { thinkingLevel: 'LOW' }, responseMimeType: 'application/json', responseJsonSchema: schema }
    },
    { preferred }
  )
  return JSON.parse(textOf(await res.json()) || 'null')
}

async function estimate(text) {
  const data = await generateJson({
    system: ESTIMATE_SYSTEM,
    prompt: text.slice(0, 500),
    schema: { type: 'object', properties: { kcal: { type: 'integer' } }, required: ['kcal'] }
  })
  const kcal = data?.kcal
  return kcal > 0 && kcal < 5000 ? kcal : null
}

async function recipe(name, kcal) {
  const data = await generateJson({
    system: RECIPE_SYSTEM,
    prompt: `Recette : ${name.slice(0, 120)}${kcal ? ` (portion d'environ ${Math.round(kcal)} kcal)` : ''}`,
    schema: RECIPE_SCHEMA,
    // Modèle plus soigné (moins de fautes) : la recette n'est générée qu'une fois puis gardée sur le téléphone
    preferred: 'gemini-3.6-flash'
  })
  if (!data?.ingredients?.length || !data?.steps?.length) throw new GeminiError(502, 'Recette incomplète')
  return data
}

function chatContents(messages) {
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
  return history
}

// Transforme le flux SSE de Gemini en texte brut envoyé au fur et à mesure à l'appli
function streamText(geminiResponse) {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  return new ReadableStream({
    async start(out) {
      const reader = geminiResponse.body.getReader()
      let buffer = ''
      let sent = false
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          // Gemini sépare les événements par \r\n\r\n : on normalise en \n
          buffer += decoder.decode(value, { stream: true }).replace(/\r/g, '')
          const events = buffer.split('\n\n')
          buffer = events.pop()
          for (const event of events) {
            const line = event.split('\n').find((l) => l.startsWith('data: '))
            if (!line) continue
            const text = textOf(JSON.parse(line.slice(6)))
            if (text) {
              out.enqueue(encoder.encode(text))
              sent = true
            }
          }
        }
      } catch (err) {
        console.error('Flux Gemini interrompu', err)
      }
      // Rien reçu = réponse bloquée par les filtres de sécurité de Gemini
      if (!sent) out.enqueue(encoder.encode(FALLBACK_REPLY))
      out.close()
    }
  })
}

async function chat(messages) {
  const contents = chatContents(messages)
  if (!contents.length) throw new GeminiError(400, 'Message vide')
  const res = await firstAvailable(
    {
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents,
      // Réflexion courte : une réponse de confidente n'a pas besoin de longue réflexion
      generationConfig: { thinkingConfig: { thinkingLevel: 'LOW' }, maxOutputTokens: 2048 }
    },
    { stream: true }
  )
  return new Response(streamText(res), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } })
}

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405)
  const user = await getUser(req)
  if (!user) return json({ error: 'Non connectée' }, 401)

  const body = await req.json().catch(() => ({}))
  try {
    if (body.mode === 'estimate') return json({ kcal: await estimate(String(body.text || '')) })
    if (body.mode === 'recipe') return json({ recipe: await recipe(String(body.name || ''), Number(body.kcal) || null) })
    return await chat(body.messages || [])
  } catch (err) {
    const status = err?.status
    if (status === 504) return json({ error: 'Luna est très demandée en ce moment, réessaie dans un instant 🌙' }, 504)
    if (status === 400 && String(err.message).includes('API_KEY_INVALID')) {
      console.error('Gemini : clé API invalide')
      return json({ error: 'Luna est indisponible : la clé Gemini est invalide (à vérifier sur Netlify) 🥺' }, 502)
    }
    console.error('Gemini', status, err?.message)
    return json({ error: `Luna est indisponible pour le moment 🥺${status ? ` (erreur ${status})` : ''}` }, 502)
  }
}

export const config = { path: '/api/luna' }
