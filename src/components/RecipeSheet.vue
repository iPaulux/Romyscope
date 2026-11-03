<script setup>
import { ref, watch } from 'vue'
import BottomSheet from './BottomSheet.vue'
import { callLuna } from '../lib/api'

const props = defineProps({
  open: Boolean,
  idea: Object // { name, emoji, kcal, slot }
})
const emit = defineEmits(['close', 'cooked'])

const recipe = ref(null)
const loading = ref(false)
const error = ref('')
const checked = ref(new Set())

// Les recettes sont gardées sur le téléphone : instantanées et dispo hors ligne la fois suivante
// v2 : version petit budget (les anciennes recettes gardées sont ignorées)
const CACHE_PREFIX = 'recipe:v2:'
// Supprime les recettes des anciennes versions pour ne pas encombrer le téléphone
try {
  Object.keys(localStorage)
    .filter((k) => k.startsWith('recipe:') && !k.startsWith(CACHE_PREFIX))
    .forEach((k) => localStorage.removeItem(k))
} catch {
  // Stockage indisponible : rien à nettoyer
}

function readCache(name) {
  try {
    return JSON.parse(localStorage.getItem(CACHE_PREFIX + name))
  } catch {
    return null
  }
}
function writeCache(name, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + name, JSON.stringify(data))
  } catch {
    // Stockage indisponible (navigation privée) : on régénérera la prochaine fois
  }
}

async function load() {
  const { name, kcal } = props.idea
  recipe.value = readCache(name)
  checked.value = new Set()
  error.value = ''
  if (recipe.value) return
  loading.value = true
  try {
    const data = await callLuna({ mode: 'recipe', name, kcal })
    recipe.value = data.recipe
    writeCache(name, data.recipe)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function toggle(i) {
  const next = new Set(checked.value)
  next.has(i) ? next.delete(i) : next.add(i)
  checked.value = next
}

watch(
  () => props.open,
  (open) => open && props.idea && load()
)
</script>

<template>
  <BottomSheet :open="open" :title="idea?.name || ''" @close="emit('close')">
    <div v-if="loading" class="state">
      <img class="cook" src="/luna.png" alt="" width="84" height="83" />
      <p class="muted">Luna prépare la recette…</p>
    </div>

    <div v-else-if="error" class="state">
      <p class="muted">{{ error }}</p>
      <button class="btn ghost sm" @click="load">Réessayer</button>
    </div>

    <template v-else-if="recipe">
      <div class="row meta">
        <span class="pill">{{ idea.emoji }} 1 portion</span>
        <span v-if="recipe.prep_minutes" class="pill">🔪 {{ recipe.prep_minutes }} min</span>
        <span v-if="recipe.cook_minutes" class="pill">🔥 {{ recipe.cook_minutes }} min</span>
        <span v-if="recipe.estimated_cost_eur" class="pill">💶 ~{{ recipe.estimated_cost_eur.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} €</span>
      </div>

      <section class="card">
        <h3>Ingrédients</h3>
        <ul class="ingredients">
          <li v-for="(ing, i) in recipe.ingredients" :key="i" :class="{ done: checked.has(i) }" @click="toggle(i)">
            <span class="box">{{ checked.has(i) ? '✓' : '' }}</span>
            <span class="grow">{{ ing.item }}</span>
            <span class="qty">{{ ing.quantity }}</span>
          </li>
        </ul>
      </section>

      <section class="card">
        <h3>Préparation</h3>
        <ol class="steps">
          <li v-for="(step, i) in recipe.steps" :key="i">
            <span class="num">{{ i + 1 }}</span>
            <span>{{ step }}</span>
          </li>
        </ol>
      </section>

      <p v-if="recipe.tip" class="card soft-lilac tip">💡 {{ recipe.tip }}</p>

      <button class="btn plain small" @click="emit('cooked', idea)">Je l'ai cuisiné → l'ajouter à mes repas</button>
    </template>
  </BottomSheet>
</template>

<style scoped>
.state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 32px 0; text-align: center; }
.cook { animation: bob 1.2s ease-in-out infinite; }
@keyframes bob { 50% { transform: translateY(-6px) rotate(-6deg); } }
.meta { flex-wrap: wrap; gap: 8px; }
.pill { background: var(--peach-soft); color: #B4643C; font-weight: 700; font-size: .85rem; padding: 6px 12px; border-radius: 999px; }
.card h3 { margin-bottom: 10px; }
.ingredients { list-style: none; margin: 0; padding: 0; }
.ingredients li {
  display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--line); cursor: pointer;
}
.ingredients li:last-child { border-bottom: 0; }
.box {
  width: 22px; height: 22px; flex: none; border-radius: 7px; border: 2px solid var(--rose);
  display: grid; place-items: center; color: #fff; font-size: .8rem; font-weight: 700;
}
.done .box { background: var(--rose); }
.done .grow, .done .qty { text-decoration: line-through; color: var(--muted); }
.grow { flex: 1; }
.qty { color: var(--muted); font-weight: 700; font-size: .92rem; white-space: nowrap; }
.steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.steps li { display: flex; gap: 12px; animation: rise .4s ease both; }
.steps li:nth-child(2) { animation-delay: .06s; }
.steps li:nth-child(3) { animation-delay: .12s; }
.steps li:nth-child(4) { animation-delay: .18s; }
.steps li:nth-child(n + 5) { animation-delay: .24s; }
.done .box { animation: pop .3s ease; }
.num {
  width: 26px; height: 26px; flex: none; border-radius: 50%; background: var(--grad); color: #fff;
  display: grid; place-items: center; font-weight: 700; font-size: .85rem;
}
.tip { margin: 0; }
</style>
