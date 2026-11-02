// Génère les icônes PNG depuis public/favicon.svg (nécessite rsvg-convert : brew install librsvg)
import { execSync } from 'node:child_process'
const sizes = { 'icon-192.png': 192, 'icon-512.png': 512, 'apple-touch-icon.png': 180 }
for (const [file, size] of Object.entries(sizes)) {
  execSync(`rsvg-convert -w ${size} -h ${size} public/favicon.svg -o public/${file}`)
  console.log('✓', file)
}
