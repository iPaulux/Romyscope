export const ENCOURAGEMENTS = [
  'Chaque petit pas compte, et tu en fais plein 🌷',
  'Ton corps mérite de la douceur, aujourd\'hui comme les autres jours 💗',
  'Tu n\'as pas besoin d\'être parfaite pour être fière de toi ✨',
  'Manger, c\'est prendre soin de toi. Tu le fais très bien 🫶',
  'Une journée difficile n\'efface pas tous tes progrès 🌈',
  'Tu es bien plus qu\'un chiffre, toujours 🌸',
  'Respire. Tu fais de ton mieux, et c\'est largement suffisant 🍃',
  'Sois aussi gentille avec toi que tu l\'es avec les autres 💕',
  'Tes efforts sont réels, même quand tu ne les vois pas ⭐',
  'Un verre d\'eau, une grande inspiration, et on repart 💧',
  'Tu es courageuse. Vraiment 🦋',
  'Le progrès, ce n\'est pas une ligne droite, et c\'est normal 🌙'
]

export function randomEncouragement() {
  return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]
}
