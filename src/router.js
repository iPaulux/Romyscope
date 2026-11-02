import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from './lib/supabase'
import { store, loadSettings } from './lib/store'

const routes = [
  { path: '/login', component: () => import('./views/LoginView.vue'), meta: { public: true } },
  { path: '/', component: () => import('./views/TodayView.vue') },
  { path: '/idees', component: () => import('./views/IdeasView.vue') },
  { path: '/planning', component: () => import('./views/PlanningView.vue') },
  { path: '/chat', component: () => import('./views/ChatView.vue') },
  { path: '/moi', component: () => import('./views/SettingsView.vue') },
  { path: '/mots-doux', component: () => import('./views/LoveNotesView.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

export const router = createRouter({ history: createWebHistory(), routes })

let ready = null
async function init() {
  const { data } = await supabase.auth.getSession()
  store.session = data.session
  if (store.session) loadSettings() // en arrière-plan : l'appli s'affiche tout de suite
  supabase.auth.onAuthStateChange((_event, session) => {
    store.session = session
    if (!session) router.replace('/login')
  })
}

router.beforeEach(async (to) => {
  ready ??= init()
  await ready
  if (!to.meta.public && !store.session) return '/login'
  if (to.path === '/login' && store.session) return '/'
})
