# Romyscope 🌷

Une PWA mobile-first toute douce, pensée pour accompagner une personne qui vit avec un TCA, avec Luna, une petite confidente propulsée par Gemini. Pensée pour un budget étudiant : **0 € par mois** (offres gratuites de Netlify, Supabase et Gemini).

**Stack :** Vue 3 + Vite, vite-plugin-pwa, Supabase (auth + BDD), Netlify (hébergement + fonctions), API Gemini, Web Push.

## Fonctionnalités

- **Aujourd'hui** : jauge douce sans chiffres, journal des repas (faim avant, ressenti après), hydratation, activités du jour, mot doux ou encouragement.
- **Idées repas** : 60 idées petit budget, 6 par repas renouvelées chaque jour, bouton « D'autres idées ». Chaque idée ouvre une **recette** pour 1 personne (ingrédients à cocher, étapes, temps, coût estimé), générée une fois par Gemini puis gardée sur le téléphone.
- **Planning** : programme sport à la maison pré-rempli chaque semaine (3 Just Dance, 2 Pilates, 1 yoga ou stretching, dimanche repos), qui varie d'une semaine à l'autre et se met en pause depuis **Moi**.
- **Luna** : chat bienveillant, consignes adaptées aux TCA et au petit budget.
- **Notifications** : rappels de repas, d'eau, de séance, mots de courage et mots doux du soir.
- **Mots doux** : page réservée à l'admin pour écrire des messages qui s'affichent sur l'accueil et arrivent en notification.
- **Hors ligne** : l'appli s'ouvre sans réseau et montre un aperçu du planning.

---

## 1. Supabase

1. Crée un projet sur [supabase.com](https://supabase.com).
2. **SQL Editor** → colle le contenu de [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
3. **Authentication → Sign In / Providers** : désactive « Allow new users to sign up » (personne d'autre ne peut créer de compte).
4. **Authentication → Users → Add user** : crée son compte (email + mot de passe, coche « Auto confirm »). Crée aussi le tien si tu veux écrire des mots doux.
5. **Project Settings → API** : récupère `Project URL`, la clé `anon` et la clé `service_role`.

> Offre gratuite : Supabase met le projet en pause après une semaine sans aucune visite. Avec une utilisation quotidienne, ça n'arrive pas.

## 2. Variables d'environnement

Copie `.env.example` en `.env` pour le local (jamais commité). Les clés VAPID (notifications) se génèrent avec :

```bash
npm run vapid
```

Sur **Netlify → Project configuration → Environment variables**, ajoute toutes les variables de `.env.example`, en choisissant « Same value for all deploy contexts ».

| Variable | Où la trouver | Scope Netlify |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase → API | Builds + Functions |
| `VITE_SUPABASE_ANON_KEY` | Supabase → API | Builds |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API (⚠️ secrète) | Functions, secrète |
| `GEMINI_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (commence par `AQ.` ou `AIza`) | Functions, secrète |
| `VITE_VAPID_PUBLIC_KEY` | `npm run vapid` | Builds + Functions |
| `VAPID_PRIVATE_KEY` | `npm run vapid` (⚠️ secrète) | Functions, secrète |
| `VAPID_SUBJECT` | `mailto:ton@email` | Functions |
| `VITE_ADMIN_EMAIL` | ton email (débloque l'écriture des mots doux) | Builds |

Les `VITE_*` sont intégrées au site : c'est normal qu'elles soient publiques. Après une modification de variable, relance un deploy (**Deploys → Trigger deploy**).

## 3. Netlify

Pousse le repo sur GitHub puis **Add new site → Import from Git**. Le fichier `netlify.toml` configure tout : build, fonctions, redirection SPA et Node 22 (requis par supabase-js côté serveur). La fonction `reminders` tourne toute seule toutes les 15 minutes, et l'Edge Function `luna` répond sur `/api/luna`.

Pour enlever le badge « Powered by Netlify » qui passe sur la barre de navigation : **Project configuration → General → Powered by Netlify badge**.

En local :

```bash
npm run dev
```

`npm run dev` suffit pour l'interface. Luna (chat, estimation, recettes) et les notifications passent par les fonctions : `npx netlify dev` (Node 22 requis).

## 4. Sur son téléphone

- **iPhone** : ouvrir le site dans Safari → Partager → « Sur l'écran d'accueil ». Les notifications ne marchent que depuis l'appli installée (iOS 16.4+).
- **Android** : Chrome propose l'installation automatiquement.
- Puis onglet **Moi** → renseigner le prénom (stocké uniquement dans la base, jamais dans le code) → activer les notifications → « Envoyer une notif test ».

---

## Choix liés aux TCA

- Jauge sans chiffres par défaut, chiffres activables dans **Moi**. En mode doux, l'objectif chiffré est aussi masqué.
- Objectif minimum bloqué à 1400 kcal (contrainte en base et dans l'interface).
- Les calories sont estimées par Gemini en silence : elle écrit juste ce qu'elle a mangé. Un repas enregistré sans estimation (panne) est ré-estimé à la prochaine ouverture.
- Aucun message négatif, même au-delà de l'objectif. Si elle se sent coupable ou stressée, l'appli répond avec douceur.
- Luna a des consignes strictes : pas de régime restrictif, pas de compensation, pas de chiffres, et orientation vers un pro et les numéros d'écoute (09 69 325 900, 3114) si besoin.
- Pas de suivi du poids, volontairement.

## Vie privée

- Offre gratuite de Gemini : Google peut réutiliser les contenus envoyés. Les fonctions n'envoient donc que les messages du chat, le nom du plat (recettes) ou la description du repas (estimation). Jamais de prénom, d'objectif ni de données de suivi.
- Le repo est public : aucune clé, aucun email, aucun prénom dans le code. Netlify bloque le build si la valeur d'une variable d'environnement apparaît dans un fichier.

## Luna et Gemini

Luna tourne dans une **Edge Function** (`netlify/edge-functions/luna.js`) qui appelle l'API Gemini directement en HTTP. Contrairement aux fonctions classiques (coupées à 10 s), elle peut attendre jusqu'à 40 s, ce qui compte car les modèles gratuits sont souvent surchargés et leur vitesse change d'un jour à l'autre.

- Le premier modèle est lancé, puis les suivants **en parallèle** s'il tarde plus de 1,5 s ou renvoie une erreur de surcharge (429, 503). La première réponse gagne, les autres sont annulées.
- Si tous sont surchargés, nouveau tour après 2 s, jusqu'à 32 s au total.
- Le chat est **diffusé au fur et à mesure** : le texte s'affiche dès les premiers mots. Après 6 s d'attente, l'appli prévient que Google est un peu chargé.
- Modèles : `gemini-3.5-flash-lite`, `gemini-3.6-flash`, `gemini-3.1-flash-lite` (liste `MODELS` dans le fichier). Les recettes commencent par `gemini-3.6-flash`, plus soigné.

## Dépannage

| Symptôme | Cause probable |
|---|---|
| « Luna est indisponible : la clé Gemini est invalide » | Clé mal copiée ou pas dans le contexte Production sur Netlify. Recolle-la puis relance un deploy. |
| « Luna est indisponible (erreur 404) » | Modèle retiré : mets à jour la liste `MODELS` dans `netlify/edge-functions/luna.js`. |
| « Luna est très demandée en ce moment » | Gemini surchargé pendant plus de 30 s ou quota gratuit atteint, réessayer un peu plus tard. |
| Erreur de Luna | Netlify → **Logs & metrics → Edge Functions** → `luna`. |
| Erreur des notifications | Netlify → **Logs & metrics → Functions**. Une variable manquante y est indiquée en clair. |
| Build bloqué par le scan de secrets | Une valeur de variable se retrouve dans un fichier du repo (souvent une valeur d'exemple). |
| Pas de demande de notification sur iPhone | Ouvrir l'appli depuis l'écran d'accueil, ou autoriser dans Réglages → Notifications → Romyscope. |
| Ancienne icône sur iPhone | Supprimer l'appli de l'écran d'accueil et la rajouter depuis Safari. |

## Visuels

Les originaux de Luna sont dans `assets-src/`. Pour régénérer le favicon, les icônes d'appli et `public/luna.png` après les avoir modifiés :

```bash
npm run icons
```

(nécessite `rsvg-convert` : `brew install librsvg`)

## Structure

```
src/
  views/        Écrans (Today, Ideas, Planning, Chat, Settings, LoveNotes, Login)
  components/   Gauge, MealSheet, RecipeSheet, BottomSheet, BottomNav
  lib/          Supabase, store, push, dates, appels API, toasts
  data/         Idées repas, programme sport, activités, encouragements
  sw.js         Service worker (cache hors ligne + notifications)
netlify/
  edge-functions/  luna (chat en streaming, estimation, recettes)
  functions/    reminders (planifiée), push-test
  lib/          Code partagé des fonctions (Supabase, push, variables)
supabase/schema.sql
assets-src/     Originaux de Luna
scripts/        Génération des icônes
```
