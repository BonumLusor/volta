<template>
  <div class="app-wrapper">
    <Corte :dados-cortes="listaDeCortes" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const listaDeCortes = ref([
  { x0: 50, x1: 150, y0: 50, y1: 130, op: 2134 },
  { x0: 200, x1: 320, y0: 150, y1: 240, op: 543 },
  { x0: 400, x1: 480, y0: 100, y1: 200, op: 2033 }
])
</script>