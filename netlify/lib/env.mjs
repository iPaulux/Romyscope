// Lit une variable d'environnement et explique clairement dans les logs Netlify si elle manque
export function env(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name}. Sur Netlify, vérifie qu'elle existe et que son scope inclut "Functions".`)
  }
  return value
}
