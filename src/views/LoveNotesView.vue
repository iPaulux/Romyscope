<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { store } from '../lib/store'
import { toast } from '../lib/toast'

const notes = ref([])
const text = ref('')

async function load() {
  const { data } = await supabase.from('love_notes').select('*').eq('author_id', store.session.user.id).order('created_at', { ascending: false })
  notes.value = data || []
}

async function add() {
  if (!text.value.trim()) return
  const { error } = await supabase.from('love_notes').insert({ content: text.value.trim() })
  if (error) return toast('Oups, pas enregistré')
  text.value = ''
  toast('Mot doux ajouté 💌')
  load()
}

async function remove(n) {
  await supabase.from('love_notes').delete().eq('id', n.id)
  load()
}

onMounted(load)
</script>

<template>
  <main class="page">
    <header class="page-head">
      <div>
        <p class="sub">Pour ton amoureuse</p>
        <h1>Mots doux 💌</h1>
      </div>
      <router-link to="/moi" class="icon-btn" aria-label="Retour">‹</router-link>
    </header>

    <section class="card stack">
      <p class="small muted">Ils s'affichent au hasard sur sa page d'accueil, et un par soir en notification (les non envoyés d'abord).</p>
      <textarea v-model="text" class="input" rows="3" placeholder="Je suis tellement fier de toi…" />
      <button class="btn block" @click="add">Ajouter</button>
    </section>

    <section class="card">
      <p v-if="!notes.length" class="empty">Aucun mot doux pour l'instant.</p>
      <div class="list">
        <div v-for="n in notes" :key="n.id" class="list-item">
          <span class="grow">{{ n.content }}<br /><span class="small muted">{{ n.pushed_at ? 'Envoyé en notif ✓' : 'Pas encore envoyé' }}</span></span>
          <button class="btn plain" aria-label="Supprimer" @click="remove(n)">✕</button>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.grow { flex: 1; }
.icon-btn { text-decoration: none; }
</style>
