<script setup>
defineProps({ open: Boolean, title: String })
const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <transition name="sheet">
      <div v-if="open" class="backdrop" @click.self="emit('close')">
        <div class="sheet" role="dialog" :aria-label="title">
          <div class="grab" />
          <div class="row between head">
            <h2>{{ title }}</h2>
            <button class="icon-btn" aria-label="Fermer" @click="emit('close')">✕</button>
          </div>
          <div class="body"><slot /></div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed; inset: 0; z-index: 80; background: rgba(74, 58, 72, .35);
  display: flex; align-items: flex-end; justify-content: center;
}
.sheet {
  width: 100%; max-width: 560px; max-height: 92dvh; overflow-y: auto;
  background: var(--bg); border-radius: 28px 28px 0 0;
  padding: 10px 16px calc(24px + var(--safe-b));
}
.grab { width: 44px; height: 5px; border-radius: 9px; background: #E8D6DD; margin: 0 auto 10px; }
.head { margin-bottom: 14px; }
.body { display: flex; flex-direction: column; gap: 16px; }
.sheet-enter-active, .sheet-leave-active { transition: opacity .25s; }
.sheet-enter-active .sheet, .sheet-leave-active .sheet { transition: transform .3s cubic-bezier(.3,.8,.3,1); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .sheet, .sheet-leave-to .sheet { transform: translateY(100%); }
</style>
