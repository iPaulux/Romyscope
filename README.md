# Romyscope 🌷

Une PWA mobile-first toute douce, pensée pour accompagner une personne qui vit avec un TCA : journal des repas (mode doux, sans chiffres par défaut), hydratation, planning d'activités à la maison, idées repas, notifications de courage et de rappel, mots doux de Paul, et Luna, une confidente propulsée par Gemini.

**Stack :** Vue 3 + Vite, vite-plugin-pwa, Supabase (auth + BDD), Netlify (hébergement + fonctions), API Gemini, Web Push.

---

## 1. Supabase

1. Crée un projet sur [supabase.com](https://supabase.com).
2. **SQL Editor** → colle le contenu de [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
3. **Authentication → Sign In / Providers** : désactive « Allow new users to sign up » (personne d'autre ne peut créer de compte).
4. **Authentication → Users → Add user** : crée son compte (email + mot de passe, coche « Auto confirm »). Crée aussi le tien si tu veux écrire des mots doux.
5. **Project Settings → API** : récupère `Project URL`, la clé `anon` et la clé `service_role`.

## 2. Variables d'environnement

Copie `.env.example` en `.env` pour le local (un `.env` avec des clés VAPID déjà générées existe). Les clés VAPID (notifications) se génèrent avec :

```bash
npm run vapid
```

Sur **Netlify → Site configuration → Environment variables**, ajoute toutes les variables de `.env.example`.

Scopes à choisir :
- Clés secrètes (`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `VAPID_PRIVATE_KEY`) : cocher « Contains secret values », scope **Functions** uniquement.
- `VITE_SUPABASE_URL` et `VITE_VAPID_PUBLIC_KEY` : scopes **Builds et Functions**, car les fonctions les lisent aussi.
- Autres `VITE_*` : scope **Builds** (elles sont intégrées au site, c'est normal qu'elles soient publiques).

| Variable | Où la trouver |
|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Supabase → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API (⚠️ secrète, jamais côté front) |
| `GEMINI_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey), offre gratuite |
| `GEMINI_MODEL` | optionnel : modèle essayé en premier. Par défaut `gemini-3.5-flash-lite`, puis `gemini-3.6-flash` et `gemini-3.1-flash-lite` si un modèle est surchargé |
| `VITE_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | `npm run vapid` |
| `VAPID_SUBJECT` | `mailto:ton@email` |
| `VITE_ADMIN_EMAIL` | ton email (débloque l'écriture des mots doux) |

## 3. Netlify

Pousse le repo sur GitHub puis **Add new site → Import from Git**. Le fichier `netlify.toml` configure tout (build, fonctions, redirection SPA). La fonction `reminders` tourne automatiquement toutes les 15 minutes.

En local avec les fonctions :

```bash
npx netlify dev
```

(`npm run dev` suffit pour l'interface, mais le chat et les notifs ont besoin des fonctions.)

## 4. Sur son téléphone

- **iPhone** : ouvrir le site dans Safari → Partager → « Sur l'écran d'accueil ». Les notifications ne marchent que depuis l'appli installée (iOS 16.4+).
- **Android** : Chrome propose l'installation automatiquement.
- Puis onglet **Moi** → renseigner le prénom (il n'est stocké que dans ta base, jamais dans le code) → activer les notifications → « Envoyer une notif test ».

## Choix liés aux TCA

- Jauge sans chiffres par défaut, chiffres activables dans **Moi**.
- Objectif minimum bloqué à 1400 kcal (contrainte en base et dans l'interface).
- En mode doux, les calories sont estimées par Gemini en silence : elle écrit juste ce qu'elle a mangé.
- Aucun message négatif, même au-delà de l'objectif. Si elle se sent coupable ou stressée, l'appli répond avec douceur.
- Offre gratuite de Gemini : Google peut réutiliser les conversations pour améliorer ses produits. La fonction n'envoie donc que les messages du chat (ni prénom, ni objectif, ni données de suivi).
- Luna (le chat) a des consignes strictes : pas de régime restrictif, pas de compensation, et orientation vers un pro et les numéros d'écoute (09 69 325 900, 3114) si besoin.

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
  components/   Gauge, MealSheet, BottomSheet, BottomNav
  lib/          Supabase, store, push, dates, appels API
  data/         Idées repas, activités, messages d'encouragement
  sw.js         Service worker (cache hors ligne + notifications)
netlify/
  functions/    chat (Gemini), reminders (planifiée), push-test
  lib/          Code partagé des fonctions
supabase/schema.sql
```
