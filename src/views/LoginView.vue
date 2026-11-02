<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { store, loadSettings } from '../lib/store'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function login() {
  error.value = ''
  loading.value = true
  const { data, error: err } = await supabase.auth.signInWithPassword({ email: email.value.trim(), password: password.value })
  loading.value = false
  if (err) {
    error.value = 'Email ou mot de passe incorrect 🥺'
    return
  }
  store.session = data.session
  loadSettings()
  router.replace('/')
}
</script>

<template>
  <main class="login">
    <div class="logo"><img src="/luna.png" alt="Luna" width="120" height="119" /></div>
    <h1>Romyscope</h1>
    <p class="muted">Ton petit coin de douceur 🌷</p>
    <form class="card stack form" @submit.prevent="login">
      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="email" class="input" type="email" autocomplete="email" required />
      </div>
      <div class="field">
        <label for="pwd">Mot de passe</label>
        <input id="pwd" v-model="password" class="input" type="password" autocomplete="current-password" required />
      </div>
      <p v-if="error" class="err small">{{ error }}</p>
      <button class="btn block" :disabled="loading">{{ loading ? 'Un instant…' : 'Entrer' }}</button>
    </form>
  </main>
</template>

<style scoped>
.login {
  min-height: 100dvh; max-width: 420px; margin: 0 auto; padding: 32px 16px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; text-align: center;
}
.logo img { animation: float 4s ease-in-out infinite; }
@keyframes float { 50% { transform: translateY(-8px); } }
h1 { margin-top: 12px; font-size: 2rem; }
.form { width: 100%; margin-top: 20px; text-align: left; }
.err { color: var(--rose-ink); }
</style>
