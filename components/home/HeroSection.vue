<!--
  Section héro de la page d'accueil.
-->
<template>
  <section class="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
    <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 text-sm text-cyber-blue">
      <span>🆕</span> Nouveau : support TikTok sans watermark
    </div>

    <h1 class="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
      Téléchargez vos
      <span class="bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink bg-clip-text text-transparent">
        médias sociaux
      </span>
      <br />
      en un clic
    </h1>

    <p class="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
      Instagram, TikTok, YouTube, Twitter. Gratuit, rapide, sans inscription. Collez votre lien
      et obtenez votre contenu instantanément.
    </p>

    <div class="flex items-center justify-center gap-4 flex-wrap">
      <NuxtLink to="#tools" class="btn-cyber btn-cyber-primary text-lg px-8 py-4">
        Commencer maintenant ⚡
      </NuxtLink>
      <NuxtLink to="/about" class="btn-cyber text-lg px-8 py-4"> En savoir plus </NuxtLink>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto">
      <div v-for="stat in stats" :key="stat.label" class="glass-card p-6">
        <div class="text-3xl font-display font-bold neon-text-blue">{{ stat.value }}</div>
        <div class="text-sm text-gray-400 mt-1">{{ stat.label }}</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const stats = [
  { value: '10M+', label: 'Téléchargements' },
  { value: '4', label: 'Plateformes' },
  { value: '1080p', label: 'Qualité max' },
  { value: '100%', label: 'Gratuit' },
]
</script>
