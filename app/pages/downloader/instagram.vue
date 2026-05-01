<!--
  Page dédiée Instagram.
-->
<template>
  <DownloaderPage :tool="tool" />
</template>

<script setup lang="ts">
import { findToolById } from '~/data/tools'

const tool = findToolById('instagram')
</script>
