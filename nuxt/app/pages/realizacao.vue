<template>
  <div class="app-wrapper">
    <RealizacaoCorte 
      v-if="dadosProntos"
      :materiais-iniciais="materiais" 
      :cortes-planejados="cortes" 
    />
    <div v-else class="loading-state">
      Carregando dados do planejamento...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const materiais = ref<any[]>([])
const cortes = ref<any[]>([])
const dadosProntos = ref(false)

onMounted(() => {
  const saved = localStorage.getItem('planoExecucao')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      materiais.value = data.materiais || []
      cortes.value = data.cortes || []
      dadosProntos.value = true
    } catch (e) {
      console.error('Erro ao carregar execução', e)
    }
  } else {
    // Fallback para teste
    materiais.value = [
      { id: 'R1', nome: 'Bobina Master 1200', largura: 1200, comprimento: 5000 }
    ]
    cortes.value = [
      { x: 100, y: 100, width: 300, height: 400, color: '#3b82f6', op: 2134, roloId: 0 }
    ]
    dadosProntos.value = true
  }
})
</script>

<style scoped>
.app-wrapper { min-height: 100vh; background-color: #f5f5f5; }
.loading-state { display: flex; align-items: center; justify-content: center; height: 100vh; color: #666; }
</style>
