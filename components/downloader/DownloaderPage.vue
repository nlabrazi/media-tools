<!--
  Template commun pour toutes les pages de downloader.
  Centralise le formulaire, l'aperçu et le sélecteur de qualité.
-->
<template>
  <section class="max-w-4xl mx-auto px-6 py-12">
    <!-- Breadcrumb -->
    <NuxtLink to="/" class="text-gray-400 hover:text-white transition-colors text-sm mb-8 inline-block">
      ← Retour aux outils
    </NuxtLink>

    <div class="flex items-center gap-4 mb-8">
      <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
        :style="{ background: `${tool.color}20`, border: `2px solid ${tool.color}40` }">
        {{ tool.icon }}
      </div>
      <div>
        <h1 class="text-3xl md:text-4xl font-display font-bold">{{ tool.name }}</h1>
        <p class="text-gray-400">{{ tool.description }}</p>
      </div>
    </div>

    <DownloaderForm v-model:url="url" :tool="tool" :is-loading="isLoading" :error="error" @fetch="fetchInfo" />

    <div v-if="result" class="mt-8">
      <DownloaderPreview :result="result">
        <template #quality-selector>
          <QualitySelector
            v-if="result.formats.length > 1"
            :formats="result.formats"
            :selected="selectedQuality"
            @update:selected="selectFormat"
          />
        </template>
      </DownloaderPreview>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Tool } from '~/data/tools'

const props = defineProps<{
  tool: Tool
}>()

const toolRef = computed(() => props.tool)

const { url, isLoading, result, error, selectedQuality, selectFormat, fetchInfo } =
  useDownloader(toolRef)
</script>
