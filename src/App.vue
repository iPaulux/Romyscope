<script setup>
import { useRoute } from 'vue-router'
import BottomNav from './components/BottomNav.vue'
import { store } from './lib/store'

const route = useRoute()
</script>

<template>
  <router-view v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
  <BottomNav v-if="store.session && !route.meta.public" />
</template>
