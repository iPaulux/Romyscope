// Lit une variable d'environnement et explique clairement dans les logs Netlify si elle manque
export function env(name) {
  // trim : un espace ou un retour à la ligne collé avec la valeur invalide une clé
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name}. Sur Netlify, vérifie qu'elle existe et que son scope inclut "Functions".`)
  }
  return value
}
