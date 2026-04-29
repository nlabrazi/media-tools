<!--
  Section "Pourquoi MediaTools".
-->
<template>
  <section class="max-w-7xl mx-auto px-6 py-20">
    <h2 class="text-3xl md:text-4xl font-display font-bold text-center mb-12">
      Pourquoi <span class="text-cyber-purple neon-text-purple">MediaTools</span> ?
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="feature in features" :key="feature.title" class="glass-card p-6 text-center">
        <div class="text-5xl mb-4">{{ feature.icon }}</div>
        <h3 class="text-xl font-display font-bold mb-2">{{ feature.title }}</h3>
        <p class="text-gray-400">{{ feature.description }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { features } from '~/data/features'
</script>
