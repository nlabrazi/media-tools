<!--
  Sélecteur de qualité (utilisé pour YouTube principalement).
-->
<template>
  <div class="mb-4">
    <label class="text-sm font-medium text-gray-400 mb-2 block">Qualité :</label>
    <div class="flex flex-wrap gap-2">
      <button v-for="quality in qualities" :key="quality" class="px-4 py-2 rounded-lg border text-sm transition-all"
        :class="selected === quality
            ? 'border-cyber-blue bg-cyber-blue/20 text-cyber-blue'
            : 'border-white/10 text-gray-400 hover:border-white/30'
          " @click="$emit('update:selected', quality)">
        {{ quality }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  qualities: string[]
  selected: string
}>()

defineEmits<{
  'update:selected': [value: string]
}>()
</script>
