<!--
  Header principal avec navigation et logo.
-->
<template>
  <header class="relative z-20 glass-card rounded-none border-t-0 border-x-0">
    <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-3 group">
        <div
          class="w-10 h-10 rounded-lg bg-gradient-to-br from-cyber-blue to-cyber-purple flex items-center justify-center text-2xl">
          ⚡
        </div>
        <span class="font-display font-bold text-2xl tracking-tight">
          Media<span class="text-cyber-blue neon-text-blue">Tools</span>
        </span>
      </NuxtLink>

      <!-- Navigation desktop -->
      <nav class="hidden md:flex items-center gap-8">
        <NuxtLink v-for="tool in tools" :key="tool.id" :to="tool.route"
          class="text-gray-300 hover:text-white transition-colors text-sm font-medium">
          {{ tool.icon }} {{ tool.name }}
        </NuxtLink>
      </nav>

      <!-- Menu mobile -->
      <button class="md:hidden text-2xl" @click="mobileOpen = !mobileOpen">
        {{ mobileOpen ? '✕' : '☰' }}
      </button>
    </div>

    <!-- Navigation mobile -->
    <div v-if="mobileOpen" class="md:hidden border-t border-white/5 px-6 py-4">
      <nav class="flex flex-col gap-3">
        <NuxtLink v-for="tool in tools" :key="tool.id" :to="tool.route"
          class="text-gray-300 hover:text-white transition-colors py-2" @click="mobileOpen = false">
          {{ tool.icon }} {{ tool.name }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { tools } from '~/data/tools'

const mobileOpen = ref(false)
</script>
