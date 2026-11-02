import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import './assets/main.css'

const app = createApp(App).use(router)

// Le splash reste au moins 1,2 s (le temps de voir Luna), puis disparaît en fondu
const SPLASH_MIN_MS = 1200
router.isReady().then(() => {
  app.mount('#app')
  const splash = document.getElementById('splash')
  if (!splash) return
  const wait = Math.max(0, SPLASH_MIN_MS - performance.now())
  setTimeout(() => {
    splash.classList.add('hide')
    // Retrait après le fondu (transitionend ne se déclenche pas toujours, ex : onglet en arrière-plan)
    setTimeout(() => splash.remove(), 600)
  }, wait)
})
