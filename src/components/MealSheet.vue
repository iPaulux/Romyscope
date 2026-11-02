<script setup>
import { ref, watch, computed } from 'vue'
import BottomSheet from './BottomSheet.vue'
import { SLOTS, HUNGER, FEELINGS, FEELING_REPLIES, defaultSlot } from '../data/meals'
import { supabase } from '../lib/supabase'
import { callFunction } from '../lib/api'
import { store } from '../lib/store'
import { toast } from '../lib/toast'

const props = defineProps({
  open: Boolean,
  day: String,
  meal: Object // repas existant (édition) ou pré-remplissage { slot, name, kcal }
})
const emit = defineEmits(['close', 'saved'])

const form = ref({})
const saving = ref(false)
const estimating = ref(false)
const showNumbers = computed(() => store.settings?.show_numbers)
const editing = computed(() => !!props.meal?.id)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    form.value = {
      slot: defaultSlot(),
      name: '',
      kcal: null,
      hunger: null,
      feeling: null,
      note: '',
      ...(props.meal || {})
    }
  }
)

async function estimate() {
  if (!form.value.name.trim()) return null
  estimating.value = true
  try {
    const { kcal } = await callFunction('chat', { mode: 'estimate', text: form.value.name })
    return kcal
  } catch {
    return null
  } finally {
    estimating.value = false
  }
}

async function estimateClick() {
  const kcal = await estimate()
  if (kcal) form.value.kcal = kcal
  else toast('Je n\'ai pas réussi à estimer, tu peux laisser vide 🌸')
}

async function save() {
  if (!form.value.name.trim()) return toast('Dis-moi ce que tu as mangé 🍽️')
  saving.value = true
  // En mode doux, on estime en silence pour que la jauge avance sans montrer de chiffre
  if (form.value.kcal == null) {
    form.value.kcal = await estimate()
  }
  const row = {
    day: props.day,
    slot: form.value.slot,
    name: form.value.name.trim(),
    kcal: form.value.kcal ? Math.round(form.value.kcal) : null,
    hunger: form.value.hunger,
    feeling: form.value.feeling,
    note: form.value.note || null
  }
  const { error } = editing.value
    ? await supabase.from('meals').update(row).eq('id', props.meal.id)
    : await supabase.from('meals').insert(row)
  saving.value = false
  if (error) return toast('Oups, ça n\'a pas été enregistré')
  toast(FEELING_REPLIES[row.feeling] || 'C\'est noté, bravo de prendre soin de toi 💗', 4500)
  emit('saved')
  emit('close')
}

async function remove() {
  await supabase.from('meals').delete().eq('id', props.meal.id)
  emit('saved')
  emit('close')
}
</script>

<template>
  <BottomSheet :open="open" :title="editing ? 'Modifier le repas' : 'J\'ai mangé…'" @close="emit('close')">
    <div class="chips">
      <button v-for="s in SLOTS" :key="s.id" class="chip" :class="{ on: form.slot === s.id }" @click="form.slot = s.id">
        {{ s.emoji }} {{ s.label }}
      </button>
    </div>

    <div class="field">
      <label for="meal-name">Quoi de bon ?</label>
      <textarea id="meal-name" v-model="form.name" class="input" rows="2" placeholder="Ex : pâtes au pesto et une pomme" />
    </div>

    <div v-if="showNumbers" class="field">
      <label for="meal-kcal">Calories <span class="muted small">(optionnel)</span></label>
      <div class="row">
        <input id="meal-kcal" v-model.number="form.kcal" class="input" type="number" inputmode="numeric" placeholder="—" />
        <button class="btn ghost sm" :disabled="estimating || !form.name" @click="estimateClick">
          {{ estimating ? '…' : 'Estimer ✨' }}
        </button>
      </div>
    </div>

    <div class="field">
      <label>Ta faim avant</label>
      <div class="chips">
        <button v-for="h in HUNGER" :key="h.value" class="chip" :class="{ on: form.hunger === h.value }" @click="form.hunger = form.hunger === h.value ? null : h.value">
          {{ h.emoji }} {{ h.label }}
        </button>
      </div>
    </div>

    <div class="field">
      <label>Comment tu te sens ?</label>
      <div class="chips">
        <button v-for="f in FEELINGS" :key="f.id" class="chip" :class="{ on: form.feeling === f.id }" @click="form.feeling = form.feeling === f.id ? null : f.id">
          {{ f.emoji }} {{ f.label }}
        </button>
      </div>
    </div>

    <div class="field">
      <label for="meal-note">Une petite note ? <span class="muted small">(optionnel)</span></label>
      <input id="meal-note" v-model="form.note" class="input" placeholder="Avec qui, où, une pensée…" />
    </div>

    <button class="btn block" :disabled="saving" @click="save">{{ saving ? 'Un instant…' : 'Enregistrer 💗' }}</button>
    <button v-if="editing" class="btn plain" @click="remove">Supprimer ce repas</button>
  </BottomSheet>
</template>
