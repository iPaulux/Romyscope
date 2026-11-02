<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabase'
import { callFunction } from '../lib/api'
import { toast } from '../lib/toast'
import { store } from '../lib/store'

const route = useRoute()
const messages = ref([])
const input = ref(route.query.q || '')
const sending = ref(false)
const scroller = ref(null)

const suggestions = [
  'J\'ai envie de craquer 🥺',
  'Je culpabilise après mon repas',
  'Motive-moi pour ma séance 💃',
  'Une idée de dîner réconfortant ?',
  'J\'ai juste besoin de parler'
]

async function scrollDown() {
  await nextTick()
  scroller.value?.scrollTo({ top: scroller.value.scrollHeight, behavior: 'smooth' })
}

async function load() {
  const { data } = await supabase.from('chat_messages').select('role, content').order('created_at', { ascending: false }).limit(60)
  messages.value = (data || []).reverse()
  scrollDown()
}

async function send(text = input.value) {
  text = text.trim()
  if (!text || sending.value) return
  input.value = ''
  messages.value.push({ role: 'user', content: text })
  sending.value = true
  scrollDown()
  supabase.from('chat_messages').insert({ role: 'user', content: text }).then()
  try {
    const { reply } = await callFunction('chat', { messages: messages.value.slice(-20) })
    messages.value.push({ role: 'assistant', content: reply })
    await supabase.from('chat_messages').insert({ role: 'assistant', content: reply })
  } catch (e) {
    toast(e.message)
  } finally {
    sending.value = false
    scrollDown()
  }
}

async function clearChat() {
  if (!confirm('Effacer toute la conversation ?')) return
  await supabase.from('chat_messages').delete().not('id', 'is', null)
  messages.value = []
}

function onKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

onMounted(load)
</script>

<template>
  <main class="chat">
    <header class="chat-head">
      <div class="avatar">🌙</div>
      <div class="grow">
        <h2>Luna</h2>
        <p class="small muted">Ta confidente, toujours là pour toi</p>
      </div>
      <button v-if="messages.length" class="btn plain small" @click="clearChat">Effacer</button>
    </header>

    <div ref="scroller" class="messages">
      <div v-if="!messages.length" class="welcome">
        <div class="big-emoji">🌙</div>
        <p class="title">Coucou{{ store.settings?.first_name ? ` ${store.settings.first_name}` : '' }}, moi c'est Luna.</p>
        <p class="muted small">Tu peux me parler de tout : une envie de craquer, une journée difficile, une idée de repas, ou juste discuter. Ici, aucun jugement 💗</p>
      </div>
      <div v-for="(m, i) in messages" :key="i" class="bubble" :class="m.role">{{ m.content }}</div>
      <div v-if="sending" class="bubble assistant typing"><i /><i /><i /></div>
      <p class="disclaimer small muted">
        Luna est une IA, pas une professionnelle de santé. Si ça ne va vraiment pas : appelle Paul, ton médecin,
        <a href="tel:0969325900">09 69 325 900</a> (Anorexie Boulimie Info Écoute) ou le <a href="tel:3114">3114</a> 24h/24.
      </p>
    </div>

    <div class="composer">
      <div v-if="!sending" class="chips scroll">
        <button v-for="s in suggestions" :key="s" class="chip" @click="send(s)">{{ s }}</button>
      </div>
      <div class="row">
        <textarea v-model="input" class="input" rows="1" placeholder="Écris-moi…" @keydown="onKey" />
        <button class="send" :disabled="sending || !input.trim()" aria-label="Envoyer" @click="send()">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M3.4 20.4l17.4-7.5a1 1 0 0 0 0-1.8L3.4 3.6a.9.9 0 0 0-1.3 1L4 11l9 1-9 1-1.9 6.4a.9.9 0 0 0 1.3 1z" /></svg>
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.chat {
  max-width: 560px; margin: 0 auto; height: 100dvh;
  display: flex; flex-direction: column;
  padding: var(--safe-t) 0 calc(var(--nav-h) + var(--safe-b));
}
.chat-head { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--line); }
.avatar { width: 46px; height: 46px; border-radius: 50%; background: var(--grad); display: grid; place-items: center; font-size: 1.4rem; }
.grow { flex: 1; }
.messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.welcome { text-align: center; padding: 24px 12px; display: flex; flex-direction: column; gap: 8px; align-items: center; }
.big-emoji { font-size: 3rem; }
.welcome .title { font-size: 1.2rem; }
.bubble { max-width: 82%; padding: 11px 15px; border-radius: 20px; white-space: pre-wrap; word-wrap: break-word; }
.bubble.user { align-self: flex-end; background: var(--grad); color: #fff; border-bottom-right-radius: 6px; }
.bubble.assistant { align-self: flex-start; background: #fff; box-shadow: var(--shadow); border-bottom-left-radius: 6px; }
.typing { display: flex; gap: 4px; padding: 15px 18px; }
.typing i { width: 7px; height: 7px; border-radius: 50%; background: var(--lilac); animation: blink 1.2s infinite; }
.typing i:nth-child(2) { animation-delay: .2s; }
.typing i:nth-child(3) { animation-delay: .4s; }
@keyframes blink { 0%, 60%, 100% { opacity: .3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }
.disclaimer { text-align: center; margin-top: auto; padding-top: 12px; font-size: .75rem; }
.disclaimer a { color: #C2577E; font-weight: 700; }
.composer { padding: 10px 16px; display: flex; flex-direction: column; gap: 10px; border-top: 1px solid var(--line); background: var(--bg); }
.composer textarea { min-height: 46px; max-height: 120px; border-radius: 23px; padding: 11px 16px; }
.send {
  width: 46px; height: 46px; flex: none; border-radius: 50%; border: 0; background: var(--grad); color: #fff;
  display: grid; place-items: center; cursor: pointer;
}
.send:disabled { opacity: .45; }
</style>
