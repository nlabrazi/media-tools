<!--
  Sélecteur de format retourné par l'analyse backend.
-->
<template>
  <div class="mb-4">
    <label class="text-sm font-medium text-gray-400 mb-2 block">Format :</label>
    <div class="flex flex-wrap gap-2">
      <button v-for="format in formats" :key="format.id" class="px-4 py-2 rounded-lg border text-sm transition-all"
        :class="selected === format.id
            ? 'border-cyber-blue bg-cyber-blue/20 text-cyber-blue'
            : 'border-white/10 text-gray-400 hover:border-white/30'
          " @click="$emit('update:selected', format.id)">
        {{ format.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DownloadFormat } from '~/shared/types/download'

defineProps<{
  formats: DownloadFormat[]
  selected: string
}>()

defineEmits<{
  'update:selected': [value: string]
}>()
</script>
