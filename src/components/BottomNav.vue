<script setup>
import { toastMessage } from '../lib/toast'

const tabs = [
  { to: '/', label: 'Aujourd\'hui', icon: 'M12 3l8 7v10a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1V10z' },
  { to: '/idees', label: 'Idées', icon: 'M12 3a6 6 0 0 0-3.5 10.9V16a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-2.1A6 6 0 0 0 12 3zM9.5 20h5' },
  { to: '/planning', label: 'Planning', icon: 'M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM4 10h16M8 3v4M16 3v4' },
  { to: '/chat', label: 'Parler', icon: 'M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-8l-5 4v-4H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z' },
  { to: '/moi', label: 'Moi', icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0' }
]
</script>

<template>
  <div v-if="toastMessage" class="toast">{{ toastMessage }}</div>
  <nav class="nav">
    <router-link v-for="t in tabs" :key="t.to" :to="t.to" class="tab" exact-active-class="active">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
        <path :d="t.icon" />
      </svg>
      <span>{{ t.label }}</span>
    </router-link>
  </nav>
</template>

<style scoped>
.nav {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 50;
  height: calc(var(--nav-h) + var(--safe-b));
  padding: 8px 8px calc(8px + var(--safe-b));
  display: flex; justify-content: space-around;
  background: rgba(255, 255, 255, .92);
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  border-top: 1px solid var(--line);
}
.tab {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
  color: #BBA6BE; text-decoration: none; font-size: .72rem; font-weight: 700; border-radius: 16px;
  transition: color .15s;
}
.tab.active { color: var(--rose-ink); }
.tab svg { transition: transform .2s; }
.tab:active svg { transform: scale(.88); }
.tab.active svg { animation: bounce .45s ease; }
</style>
