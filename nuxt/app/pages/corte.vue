<template>
  <div class="app-wrapper">
    <!-- Removida qualquer trava de erro para garantir que o componente sempre carregue -->
    <Corte 
      :materiais-iniciais="materiais" 
      :ops-iniciais="ops" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const materiais = ref<any[]>([])
const ops = ref<any[]>([])

onMounted(() => {
  console.log('corte.vue page mounted - recuperando dados')
  
  let planoCorte = null

  // 1. Tenta pelo history.state
  const state = window.history.state
  if (state && state.planoCorte) {
    planoCorte = state.planoCorte
    console.log('Dados recuperados via history.state')
  } 
  // 2. Tenta pelo localStorage
  else {
    const saved = localStorage.getItem('planoCorte')
    if (saved) {
      try {
        planoCorte = JSON.parse(saved)
        console.log('Dados recuperados via localStorage')
      } catch (e) {
        console.error('Erro ao ler localStorage', e)
      }
    }
  }

  if (planoCorte) {
    materiais.value = planoCorte.materiais || []
    ops.value = planoCorte.ops || []
  } else {
    console.warn('Nenhum plano encontrado. O componente usará seus fallbacks internos.')
  }
})
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>