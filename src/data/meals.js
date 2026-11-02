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
export const IDEAS = [
  // Petit-déj
  { slot: 'breakfast', name: 'Porridge banane & cannelle', kcal: 350, tags: ['réconfortant'], emoji: '🥣' },
  { slot: 'breakfast', name: 'Yaourt grec, fruits rouges & granola', kcal: 320, tags: ['rapide'], emoji: '🍓' },
  { slot: 'breakfast', name: 'Tartines pain complet, avocat & œuf', kcal: 400, tags: ['protéiné'], emoji: '🥑' },
  { slot: 'breakfast', name: 'Pancakes flocons d\'avoine & banane', kcal: 380, tags: ['gourmand'], emoji: '🥞' },
  { slot: 'breakfast', name: 'Smoothie bowl mangue & coco', kcal: 330, tags: ['frais'], emoji: '🥭' },
  { slot: 'breakfast', name: 'Overnight oats pomme & noisettes', kcal: 360, tags: ['préparé la veille'], emoji: '🍎' },
  { slot: 'breakfast', name: 'Tartine ricotta, miel & poire', kcal: 330, tags: ['douceur'], emoji: '🍐' },
  { slot: 'breakfast', name: 'Œufs brouillés, pain complet & tomates', kcal: 380, tags: ['salé'], emoji: '🍳' },
  { slot: 'breakfast', name: 'Skyr, kiwi & graines de chia', kcal: 280, tags: ['léger'], emoji: '🥝' },
  { slot: 'breakfast', name: 'Pain perdu au four & fruits rouges', kcal: 390, tags: ['week-end'], emoji: '🍞' },
  { slot: 'breakfast', name: 'Muesli, lait d\'amande & banane', kcal: 340, tags: ['rapide'], emoji: '🍌' },
  { slot: 'breakfast', name: 'Bagel saumon fumé & fromage frais', kcal: 400, tags: ['salé'], emoji: '🥯' },
  { slot: 'breakfast', name: 'Porridge chocolat noir & framboises', kcal: 370, tags: ['gourmand'], emoji: '🍫' },
  { slot: 'breakfast', name: 'Crêpe complète œuf & fromage', kcal: 390, tags: ['salé'], emoji: '🫓' },
  { slot: 'breakfast', name: 'Fromage blanc, compote & flocons d\'avoine', kcal: 300, tags: ['doux'], emoji: '🍏' },

  // Déjeuner
  { slot: 'lunch', name: 'Buddha bowl quinoa, pois chiches & légumes rôtis', kcal: 550, tags: ['complet'], emoji: '🥗' },
  { slot: 'lunch', name: 'Wrap poulet, crudités & sauce yaourt', kcal: 480, tags: ['rapide'], emoji: '🌯' },
  { slot: 'lunch', name: 'Pâtes complètes tomate, thon & basilic', kcal: 560, tags: ['réconfortant'], emoji: '🍝' },
  { slot: 'lunch', name: 'Salade de lentilles, feta & betterave', kcal: 500, tags: ['sans cuisson'], emoji: '🫘' },
  { slot: 'lunch', name: 'Poke bowl saumon, riz & edamame', kcal: 600, tags: ['frais'], emoji: '🍣' },
  { slot: 'lunch', name: 'Croque-monsieur maison & salade verte', kcal: 520, tags: ['réconfortant'], emoji: '🥪' },
  { slot: 'lunch', name: 'Riz cantonais aux crevettes & petits pois', kcal: 540, tags: ['rapide'], emoji: '🍤' },
  { slot: 'lunch', name: 'Quiche aux poireaux & salade', kcal: 560, tags: ['préparé à l\'avance'], emoji: '🥧' },
  { slot: 'lunch', name: 'Salade César poulet & croûtons', kcal: 510, tags: ['frais'], emoji: '🥬' },
  { slot: 'lunch', name: 'Chili sin carne & riz', kcal: 570, tags: ['végé'], emoji: '🌶️' },
  { slot: 'lunch', name: 'Pita falafels, houmous & crudités', kcal: 580, tags: ['végé'], emoji: '🧆' },
  { slot: 'lunch', name: 'Risotto champignons & parmesan', kcal: 580, tags: ['réconfortant'], emoji: '🍄' },
  { slot: 'lunch', name: 'Nouilles sautées poulet & légumes', kcal: 560, tags: ['wok'], emoji: '🍜' },
  { slot: 'lunch', name: 'Taboulé, poulet grillé & menthe', kcal: 500, tags: ['frais'], emoji: '🌿' },
  { slot: 'lunch', name: 'Omelette aux pommes de terre & salade', kcal: 490, tags: ['simple'], emoji: '🥔' },

  // Goûter
  { slot: 'snack', name: 'Pomme & beurre de cacahuète', kcal: 200, tags: ['rapide'], emoji: '🍎' },
  { slot: 'snack', name: 'Fromage blanc, miel & noix', kcal: 220, tags: ['protéiné'], emoji: '🍯' },
  { slot: 'snack', name: '2 carrés de chocolat noir & amandes', kcal: 180, tags: ['gourmand'], emoji: '🍫' },
  { slot: 'snack', name: 'Galettes de riz & houmous', kcal: 160, tags: ['salé'], emoji: '🧆' },
  { slot: 'snack', name: 'Banana bread maison (1 tranche)', kcal: 230, tags: ['gourmand'], emoji: '🍌' },
  { slot: 'snack', name: 'Yaourt & compote sans sucre ajouté', kcal: 150, tags: ['doux'], emoji: '🥛' },
  { slot: 'snack', name: 'Tartine pain complet & beurre de noisette', kcal: 210, tags: ['réconfortant'], emoji: '🌰' },
  { slot: 'snack', name: 'Smoothie banane, fraise & lait', kcal: 200, tags: ['frais'], emoji: '🥤' },
  { slot: 'snack', name: 'Poignée de fruits secs & une clémentine', kcal: 190, tags: ['nomade'], emoji: '🍊' },
  { slot: 'snack', name: 'Cookie maison & un verre de lait', kcal: 240, tags: ['gourmand'], emoji: '🍪' },
  { slot: 'snack', name: 'Bâtonnets de carotte & guacamole', kcal: 150, tags: ['salé'], emoji: '🥕' },
  { slot: 'snack', name: 'Muffin myrtilles maison', kcal: 230, tags: ['fait maison'], emoji: '🧁' },
  { slot: 'snack', name: 'Pop-corn maison (un bol)', kcal: 160, tags: ['soirée film'], emoji: '🍿' },
  { slot: 'snack', name: 'Crêpe confiture', kcal: 210, tags: ['douceur'], emoji: '🥞' },
  { slot: 'snack', name: 'Edamame & une pincée de sel', kcal: 170, tags: ['protéiné'], emoji: '🫛' },

  // Dîner
  { slot: 'dinner', name: 'Soupe de potiron & tartine de chèvre', kcal: 450, tags: ['réconfortant'], emoji: '🎃' },
  { slot: 'dinner', name: 'Omelette aux légumes & pain complet', kcal: 430, tags: ['rapide'], emoji: '🍳' },
  { slot: 'dinner', name: 'Curry de lentilles corail & riz basmati', kcal: 550, tags: ['réconfortant'], emoji: '🍛' },
  { slot: 'dinner', name: 'Saumon au four, patate douce & haricots', kcal: 580, tags: ['complet'], emoji: '🐟' },
  { slot: 'dinner', name: 'Tacos maison poulet & guacamole', kcal: 560, tags: ['fun'], emoji: '🌮' },
  { slot: 'dinner', name: 'Gratin de courgettes & quinoa', kcal: 480, tags: ['four'], emoji: '🥘' },
  { slot: 'dinner', name: 'Pâtes pesto, dinde & tomates cerises', kcal: 560, tags: ['rapide'], emoji: '🍝' },
  { slot: 'dinner', name: 'Pizza maison légumes & mozzarella (½)', kcal: 550, tags: ['fun'], emoji: '🍕' },
  { slot: 'dinner', name: 'Velouté de légumes, œuf mollet & mouillettes', kcal: 420, tags: ['doux'], emoji: '🥚' },
  { slot: 'dinner', name: 'Wok de crevettes, légumes & nouilles', kcal: 520, tags: ['wok'], emoji: '🦐' },
  { slot: 'dinner', name: 'Poulet rôti, purée maison & haricots verts', kcal: 570, tags: ['réconfortant'], emoji: '🍗' },
  { slot: 'dinner', name: 'Hachis parmentier (une part)', kcal: 540, tags: ['réconfortant'], emoji: '🥔' },
  { slot: 'dinner', name: 'Galette bretonne complète & salade', kcal: 510, tags: ['crêpes party'], emoji: '🫓' },
  { slot: 'dinner', name: 'Dahl de pois chiches & naan', kcal: 560, tags: ['végé'], emoji: '🫘' },
  { slot: 'dinner', name: 'Cabillaud, riz & sauce citron', kcal: 480, tags: ['léger'], emoji: '🍋' }
]
