<template>
  <div>
    <!-- NuxtPage renderiza o conteúdo baseado na rota (ex: /corte) -->
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
</script>

<style>
    .app-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.app-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  margin-bottom: 20px;
  color: #333;
}
</style>