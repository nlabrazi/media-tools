<!--
  Formulaire de téléchargement avec input et bouton.
-->
<template>
  <div class="glass-card p-8">
    <div class="flex flex-col md:flex-row gap-4">
      <div class="flex-1 relative">
        <div class="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">{{ tool.icon }}</div>
        <input v-model="url" type="url" :placeholder="tool.placeholder" class="glass-input !pl-14"
          :class="{ '!border-cyber-pink/50': error }" @keyup.enter="emit('fetch')" />
      </div>
      <button class="btn-cyber btn-cyber-primary whitespace-nowrap" :disabled="isLoading" @click="emit('fetch')">
        <span v-if="isLoading" class="animate-spin mr-2">⏳</span>
        {{ isLoading ? 'Analyse en cours...' : 'Analyser le lien' }}
      </button>
    </div>

    <!-- Erreur -->
    <p v-if="error" class="mt-3 text-cyber-pink text-sm flex items-center gap-2">
      ❌ {{ error }}
    </p>

    <!-- Indications -->
    <div class="mt-4 flex flex-wrap gap-2">
      <span v-for="format in tool.supportedFormats" :key="format"
        class="px-3 py-1 rounded-full text-xs font-medium border opacity-70"
        :style="{ color: tool.color, borderColor: `${tool.color}40`, background: `${tool.color}10` }">
        {{ format }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Tool } from '~/data/tools'

defineProps<{
  tool: Tool
  isLoading: boolean
  error: string | null
}>()

const url = defineModel<string>('url', { required: true })

const emit = defineEmits<{
  fetch: []
}>()
</script>
