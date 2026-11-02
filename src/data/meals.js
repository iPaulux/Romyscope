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

// Portions pensées pour ~1750 kcal/jour : petit-déj 300-400, déjeuner 450-600, goûter 150-250, dîner 400-580
// Petit budget étudiant : ingrédients de base, légumineuses, œufs, surgelés, fruits de saison
export const IDEAS = [
  // Petit-déj
  { slot: 'breakfast', name: 'Porridge banane & cannelle', kcal: 350, tags: ['réconfortant'], emoji: '🥣' },
  { slot: 'breakfast', name: 'Yaourt nature, fruits rouges surgelés & flocons d\'avoine', kcal: 300, tags: ['rapide'], emoji: '🍓' },
  { slot: 'breakfast', name: 'Tartines pain complet, œuf & tomate', kcal: 360, tags: ['protéiné'], emoji: '🍅' },
  { slot: 'breakfast', name: 'Pancakes flocons d\'avoine & banane', kcal: 380, tags: ['gourmand'], emoji: '🥞' },
  { slot: 'breakfast', name: 'Smoothie bowl banane & flocons d\'avoine', kcal: 330, tags: ['frais'], emoji: '🍌' },
  { slot: 'breakfast', name: 'Overnight oats pomme & noisettes', kcal: 360, tags: ['préparé la veille'], emoji: '🍎' },
  { slot: 'breakfast', name: 'Tartine fromage frais, miel & poire', kcal: 330, tags: ['douceur'], emoji: '🍐' },
  { slot: 'breakfast', name: 'Œufs brouillés, pain complet & tomates', kcal: 380, tags: ['salé'], emoji: '🍳' },
  { slot: 'breakfast', name: 'Fromage blanc, kiwi & flocons d\'avoine', kcal: 280, tags: ['léger'], emoji: '🥝' },
  { slot: 'breakfast', name: 'Pain perdu avec le pain rassis & cannelle', kcal: 390, tags: ['anti-gaspi'], emoji: '🍞' },
  { slot: 'breakfast', name: 'Muesli, lait & banane', kcal: 340, tags: ['rapide'], emoji: '🥛' },
  { slot: 'breakfast', name: 'Tartines fromage frais & concombre', kcal: 320, tags: ['salé'], emoji: '🥒' },
  { slot: 'breakfast', name: 'Porridge cacao & banane', kcal: 370, tags: ['gourmand'], emoji: '🍫' },
  { slot: 'breakfast', name: 'Crêpe complète œuf & fromage', kcal: 390, tags: ['salé'], emoji: '🫓' },
  { slot: 'breakfast', name: 'Fromage blanc, compote & flocons d\'avoine', kcal: 300, tags: ['doux'], emoji: '🍏' },

  // Déjeuner
  { slot: 'lunch', name: 'Bowl riz, pois chiches & légumes rôtis', kcal: 550, tags: ['complet'], emoji: '🥗' },
  { slot: 'lunch', name: 'Wrap poulet, crudités & sauce yaourt', kcal: 480, tags: ['rapide'], emoji: '🌯' },
  { slot: 'lunch', name: 'Pâtes complètes tomate, thon & basilic', kcal: 560, tags: ['réconfortant'], emoji: '🍝' },
  { slot: 'lunch', name: 'Salade de lentilles, feta & betterave', kcal: 500, tags: ['sans cuisson'], emoji: '🫘' },
  { slot: 'lunch', name: 'Bowl riz, œuf, carottes râpées & sauce soja', kcal: 520, tags: ['frais'], emoji: '🍚' },
  { slot: 'lunch', name: 'Croque-monsieur maison & salade verte', kcal: 520, tags: ['réconfortant'], emoji: '🥪' },
  { slot: 'lunch', name: 'Riz cantonais œuf, jambon & petits pois', kcal: 540, tags: ['anti-gaspi'], emoji: '🍳' },
  { slot: 'lunch', name: 'Quiche aux poireaux & salade', kcal: 560, tags: ['préparé à l\'avance'], emoji: '🥧' },
  { slot: 'lunch', name: 'Salade César poulet & croûtons', kcal: 510, tags: ['frais'], emoji: '🥬' },
  { slot: 'lunch', name: 'Chili sin carne & riz', kcal: 570, tags: ['végé'], emoji: '🌶️' },
  { slot: 'lunch', name: 'Pita falafels, houmous & crudités', kcal: 580, tags: ['végé'], emoji: '🧆' },
  { slot: 'lunch', name: 'Pâtes crémeuses aux champignons', kcal: 570, tags: ['réconfortant'], emoji: '🍄' },
  { slot: 'lunch', name: 'Nouilles sautées poulet & légumes', kcal: 560, tags: ['wok'], emoji: '🍜' },
  { slot: 'lunch', name: 'Taboulé maison & œuf dur', kcal: 480, tags: ['frais'], emoji: '🌿' },
  { slot: 'lunch', name: 'Omelette aux pommes de terre & salade', kcal: 490, tags: ['simple'], emoji: '🥔' },

  // Goûter
  { slot: 'snack', name: 'Pomme & beurre de cacahuète', kcal: 200, tags: ['rapide'], emoji: '🍎' },
  { slot: 'snack', name: 'Fromage blanc & cuillère de miel', kcal: 180, tags: ['protéiné'], emoji: '🍯' },
  { slot: 'snack', name: '2 carrés de chocolat & une banane', kcal: 190, tags: ['gourmand'], emoji: '🍫' },
  { slot: 'snack', name: 'Galettes de riz & houmous maison', kcal: 160, tags: ['salé'], emoji: '🧆' },
  { slot: 'snack', name: 'Banana bread maison (1 tranche)', kcal: 230, tags: ['gourmand'], emoji: '🍌' },
  { slot: 'snack', name: 'Yaourt & compote sans sucre ajouté', kcal: 150, tags: ['doux'], emoji: '🥛' },
  { slot: 'snack', name: 'Tartine pain complet & confiture', kcal: 200, tags: ['réconfortant'], emoji: '🍓' },
  { slot: 'snack', name: 'Smoothie banane, fraise & lait', kcal: 200, tags: ['frais'], emoji: '🥤' },
  { slot: 'snack', name: 'Deux clémentines & un yaourt', kcal: 160, tags: ['nomade'], emoji: '🍊' },
  { slot: 'snack', name: 'Cookie maison & un verre de lait', kcal: 240, tags: ['gourmand'], emoji: '🍪' },
  { slot: 'snack', name: 'Bâtonnets de carotte & fromage frais', kcal: 150, tags: ['salé'], emoji: '🥕' },
  { slot: 'snack', name: 'Muffin banane maison', kcal: 220, tags: ['anti-gaspi'], emoji: '🧁' },
  { slot: 'snack', name: 'Pop-corn maison (un bol)', kcal: 160, tags: ['soirée film'], emoji: '🍿' },
  { slot: 'snack', name: 'Crêpe confiture', kcal: 210, tags: ['douceur'], emoji: '🥞' },
  { slot: 'snack', name: 'Pois chiches grillés au four', kcal: 170, tags: ['croustillant'], emoji: '🫛' },

  // Dîner
  { slot: 'dinner', name: 'Soupe de potiron & tartine de chèvre', kcal: 450, tags: ['réconfortant'], emoji: '🎃' },
  { slot: 'dinner', name: 'Omelette aux légumes & pain complet', kcal: 430, tags: ['rapide'], emoji: '🍳' },
  { slot: 'dinner', name: 'Curry de lentilles corail & riz basmati', kcal: 550, tags: ['réconfortant'], emoji: '🍛' },
  { slot: 'dinner', name: 'Colin surgelé au four, pommes de terre & haricots', kcal: 520, tags: ['complet'], emoji: '🐟' },
  { slot: 'dinner', name: 'Tortillas haricots rouges, maïs & fromage', kcal: 560, tags: ['fun'], emoji: '🌮' },
  { slot: 'dinner', name: 'Gratin de courgettes & riz', kcal: 480, tags: ['four'], emoji: '🥘' },
  { slot: 'dinner', name: 'Pâtes pesto, dinde & tomates cerises', kcal: 560, tags: ['rapide'], emoji: '🍝' },
  { slot: 'dinner', name: 'Pizza maison légumes & mozzarella (½)', kcal: 550, tags: ['fun'], emoji: '🍕' },
  { slot: 'dinner', name: 'Velouté de légumes, œuf mollet & mouillettes', kcal: 420, tags: ['doux'], emoji: '🥚' },
  { slot: 'dinner', name: 'Wok de légumes surgelés, œuf & nouilles', kcal: 500, tags: ['wok'], emoji: '🥢' },
  { slot: 'dinner', name: 'Pilons de poulet, purée maison & haricots verts', kcal: 570, tags: ['réconfortant'], emoji: '🍗' },
  { slot: 'dinner', name: 'Hachis parmentier (une part)', kcal: 540, tags: ['réconfortant'], emoji: '🥔' },
  { slot: 'dinner', name: 'Galette bretonne complète & salade', kcal: 510, tags: ['crêpes party'], emoji: '🫓' },
  { slot: 'dinner', name: 'Dahl de pois chiches & riz', kcal: 540, tags: ['végé'], emoji: '🫘' },
  { slot: 'dinner', name: 'Soupe de lentilles & tartine fromage', kcal: 480, tags: ['batch cooking'], emoji: '🥣' }
]
