<!--
  Fond de particules animées générées aléatoirement.
-->
<template>
  <div class="particles-container" aria-hidden="true">
    <div v-for="i in 50" :key="i" class="particle" :style="{
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 4 + 1}px`,
      height: `${Math.random() * 4 + 1}px`,
      animationDuration: `${Math.random() * 10 + 10}s`,
      animationDelay: `${Math.random() * 10}s`,
      background: ['#00d4ff', '#b366ff', '#ff2d95', '#00ff88'][Math.floor(Math.random() * 4)]
    }" />
  </div>
</template>
