// Génère icônes et images de Luna depuis assets-src/mascot-luna.svg (nécessite rsvg-convert : brew install librsvg)
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const tmp = mkdtempSync(join(tmpdir(), 'romyscope-icons-'))
const mascot1024 = join(tmp, 'mascot-1024.png')
execSync(`rsvg-convert -w 1024 assets-src/mascot-luna.svg -o ${mascot1024}`)
const b64 = readFileSync(mascot1024).toString('base64')

// Icône : fond rose très clair opaque (iOS met du noir sous la transparence) + Luna centrée à 72 %
const wrapper = join(tmp, 'icon.svg')
writeFileSync(wrapper, `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1024 1024">
  <defs><radialGradient id="bg" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F8E4F9"/></radialGradient></defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <image x="143" y="150" width="738" height="731" xlink:href="data:image/png;base64,${b64}"/>
</svg>`)

const icons = { 'icon-512.png': 512, 'icon-192.png': 192, 'apple-touch-icon.png': 180, 'favicon.png': 64 }
for (const [file, size] of Object.entries(icons)) {
  execSync(`rsvg-convert -w ${size} -h ${size} ${wrapper} -o public/${file}`)
  console.log('✓', file)
}
// Luna seule, fond transparent, pour l'interface (avatar du chat, page de connexion)
execSync(`rsvg-convert -w 256 assets-src/mascot-luna.svg -o public/luna.png`)
console.log('✓ luna.png')
