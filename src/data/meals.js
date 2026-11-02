export const SLOTS = [
  { id: 'breakfast', label: 'Petit-déj', emoji: '🥐' },
  { id: 'lunch', label: 'Déjeuner', emoji: '🍝' },
  { id: 'snack', label: 'Goûter', emoji: '🍓' },
  { id: 'dinner', label: 'Dîner', emoji: '🍲' },
  { id: 'extra', label: 'En plus', emoji: '🍫' }
]

export function defaultSlot() {
  const h = new Date().getHours()
  if (h < 11) return 'breakfast'
  if (h < 15) return 'lunch'
  if (h < 18) return 'snack'
  return 'dinner'
}

export const HUNGER = [
  { value: 1, emoji: '😶', label: 'Pas faim' },
  { value: 2, emoji: '🙂', label: 'Un peu' },
  { value: 3, emoji: '😋', label: 'Faim' },
  { value: 4, emoji: '🤤', label: 'Très faim' },
  { value: 5, emoji: '😵', label: 'Affamée' }
]

export const FEELINGS = [
  { id: 'serene', emoji: '😌', label: 'Sereine' },
  { id: 'happy', emoji: '🥰', label: 'Contente' },
  { id: 'neutral', emoji: '😐', label: 'Neutre' },
  { id: 'full', emoji: '😮‍💨', label: 'Trop pleine' },
  { id: 'hungry', emoji: '🥺', label: 'Encore faim' },
  { id: 'guilty', emoji: '😔', label: 'Coupable' },
  { id: 'anxious', emoji: '😰', label: 'Stressée' }
]

// Messages doux affichés selon le ressenti (jamais de reproche)
export const FEELING_REPLIES = {
  guilty: "Manger n'est jamais une faute. Tu as nourri ton corps, et ça, c'est prendre soin de toi 💗",
  anxious: "Respire doucement. Ce repas ne définit pas ta journée, et encore moins qui tu es 🌸",
  full: "Ça arrive, et c'est ok. Ton corps sait gérer, fais-lui confiance 🫶",
  hungry: "Tu as le droit de te resservir ou de prendre un petit en-cas. Écouter sa faim, c'est une victoire ✨"
}

export const IDEAS = [
  { slot: 'breakfast', name: 'Porridge banane & cannelle', kcal: 350, tags: ['réconfortant'], emoji: '🥣' },
  { slot: 'breakfast', name: 'Yaourt grec, fruits rouges & granola', kcal: 320, tags: ['rapide'], emoji: '🍓' },
  { slot: 'breakfast', name: 'Tartines pain complet, avocat & œuf', kcal: 400, tags: ['protéiné'], emoji: '🥑' },
  { slot: 'breakfast', name: 'Pancakes flocons d\'avoine & banane', kcal: 380, tags: ['gourmand'], emoji: '🥞' },
  { slot: 'breakfast', name: 'Smoothie bowl mangue & coco', kcal: 330, tags: ['frais'], emoji: '🥭' },
  { slot: 'lunch', name: 'Buddha bowl quinoa, pois chiches & légumes rôtis', kcal: 550, tags: ['complet'], emoji: '🥗' },
  { slot: 'lunch', name: 'Wrap poulet, crudités & sauce yaourt', kcal: 480, tags: ['rapide'], emoji: '🌯' },
  { slot: 'lunch', name: 'Pâtes complètes tomate, thon & basilic', kcal: 560, tags: ['réconfortant'], emoji: '🍝' },
  { slot: 'lunch', name: 'Salade de lentilles, feta & betterave', kcal: 500, tags: ['sans cuisson'], emoji: '🫘' },
  { slot: 'lunch', name: 'Poke bowl saumon, riz & edamame', kcal: 600, tags: ['frais'], emoji: '🍣' },
  { slot: 'snack', name: 'Pomme & beurre de cacahuète', kcal: 200, tags: ['rapide'], emoji: '🍎' },
  { slot: 'snack', name: 'Fromage blanc, miel & noix', kcal: 220, tags: ['protéiné'], emoji: '🍯' },
  { slot: 'snack', name: '2 carrés de chocolat noir & amandes', kcal: 180, tags: ['gourmand'], emoji: '🍫' },
  { slot: 'snack', name: 'Galettes de riz & houmous', kcal: 160, tags: ['salé'], emoji: '🧆' },
  { slot: 'snack', name: 'Banana bread maison (1 tranche)', kcal: 230, tags: ['gourmand'], emoji: '🍌' },
  { slot: 'dinner', name: 'Soupe de potiron & tartine de chèvre', kcal: 450, tags: ['réconfortant'], emoji: '🎃' },
  { slot: 'dinner', name: 'Omelette aux légumes & pain complet', kcal: 430, tags: ['rapide'], emoji: '🍳' },
  { slot: 'dinner', name: 'Curry de lentilles corail & riz basmati', kcal: 550, tags: ['réconfortant'], emoji: '🍛' },
  { slot: 'dinner', name: 'Saumon au four, patate douce & haricots', kcal: 580, tags: ['complet'], emoji: '🐟' },
  { slot: 'dinner', name: 'Tacos maison poulet & guacamole', kcal: 560, tags: ['fun'], emoji: '🌮' },
  { slot: 'dinner', name: 'Gratin de courgettes & quinoa', kcal: 480, tags: ['four'], emoji: '🥘' }
]
