<!--
  Page dédiée Instagram.
-->
<template>
  <DownloaderPage :tool="tool" />
</template>

<script setup lang="ts">
import { tools } from '~/data/tools'

const tool = tools.find((t) => t.id === 'instagram')!
</script>
