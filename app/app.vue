<!--
  Layout racine : fond de particules, header, contenu, footer, notifications.
-->
<template>
  <div class="relative min-h-screen flex flex-col">
    <ParticlesBackground />
    <TheHeader />
    <main class="flex-1 relative z-10">
      <NuxtPage />
    </main>
    <TheFooter />

    <!-- Notifications Toast -->
    <TransitionGroup name="toast" tag="div" class="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <div v-for="notification in notifications" :key="notification.id"
        class="glass-card px-6 py-4 flex items-center gap-3 min-w-[320px] animate-slide-up" :class="{
          'border-cyber-green/50 text-cyber-green': notification.type === 'success',
          'border-cyber-pink/50 text-cyber-pink': notification.type === 'error',
          'border-cyber-blue/50 text-cyber-blue': notification.type === 'info',
          'border-cyber-yellow/50 text-cyber-yellow': notification.type === 'loading'
        }">
        <span v-if="notification.type === 'success'">✅</span>
        <span v-else-if="notification.type === 'error'">❌</span>
        <span v-else-if="notification.type === 'loading'" class="animate-spin">⏳</span>
        <span v-else>ℹ️</span>
        <span class="text-sm font-medium">{{ notification.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useNotification } from './composables/useNotification'

const { notifications } = useNotification()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
