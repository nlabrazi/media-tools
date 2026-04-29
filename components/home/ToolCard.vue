<!--
  Carte d'un outil de téléchargement.
-->
<template>
  <NuxtLink :to="tool.route" class="glass-card glass-card-hover p-8 block group">
    <div class="flex items-start gap-5">
      <div
        class="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0 transition-transform group-hover:scale-110"
        :style="{ background: `${tool.color}20`, border: `2px solid ${tool.color}40` }">
        {{ tool.icon }}
      </div>
      <div>
        <h3 class="text-2xl font-display font-bold mb-2">{{ tool.name }}</h3>
        <p class="text-gray-400 mb-4">{{ tool.description }}</p>
        <div class="flex flex-wrap gap-2">
          <span v-for="format in tool.supportedFormats" :key="format"
            class="px-3 py-1 rounded-full text-xs font-medium border"
            :style="{ color: tool.color, borderColor: `${tool.color}40`, background: `${tool.color}10` }">
            {{ format }}
          </span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Tool } from '~/data/tools'

defineProps<{
  tool: Tool
}>()
</script>
