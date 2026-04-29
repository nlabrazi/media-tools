<!--
  Grille des outils disponibles.
-->
<template>
  <section id="tools" class="max-w-7xl mx-auto px-6 py-20">
    <h2 class="text-3xl md:text-4xl font-display font-bold text-center mb-4">
      Choisissez votre <span class="text-cyber-blue neon-text-blue">plateforme</span>
    </h2>
    <p class="text-gray-400 text-center mb-12">Sélectionnez le réseau social pour commencer</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ToolCard v-for="tool in tools" :key="tool.id" :tool="tool" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { tools } from '~/data/tools'
</script>
