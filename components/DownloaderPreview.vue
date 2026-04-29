<!--
  Aperçu du média trouvé.
-->
<template>
  <div class="glass-card p-8 animate-slide-up">
    <div class="flex flex-col md:flex-row gap-8">
      <!-- Preview image -->
      <div class="flex-shrink-0">
        <img :src="result.preview" :alt="result.filename"
          class="w-full md:w-72 rounded-xl object-cover border border-white/10" loading="lazy" />
      </div>

      <!-- Infos -->
      <div class="flex-1">
        <h3 class="text-2xl font-display font-bold mb-4">Média trouvé ✅</h3>
        <div class="space-y-3 mb-6">
          <div class="flex items-center gap-2 text-gray-300">
            <span>📄</span> {{ result.filename }}
          </div>
          <div class="flex items-center gap-2 text-gray-300">
            <span>📏</span> {{ result.quality }}
          </div>
          <div class="flex items-center gap-2 text-gray-300">
            <span>💾</span> {{ result.fileSize }}
          </div>
        </div>

        <slot name="quality-selector" />

        <button class="btn-cyber btn-cyber-primary w-full mt-4 text-lg">
          ⬇ Télécharger {{ result.filename }}
        </button>
        <p class="text-xs text-gray-500 mt-2 text-center">
          (Backend à connecter — pour l'instant, bouton simulé)
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DownloadResult } from '~/composables/useDownloader'

defineProps<{
  result: DownloadResult
}>()
</script>
