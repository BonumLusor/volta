<template>
  <div class="app-wrapper">
    <!-- Componente de Corte recebendo os dados processados -->
    <Corte 
      :materiais-iniciais="materiais" 
      :ops-iniciais="ops" 
      :produto-base="produtoBase"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const materiais = ref<any[]>([])
const ops = ref<any[]>([])
const produtoBase = ref<any>(null)

onMounted(() => {
  console.log('corte.vue page mounted - recuperando dados...')
  
  let payload = null

  // 1. Tenta recuperar o novo formato (planoCorteCompleto) do history.state
  const state = window.history.state
  if (state && state.planoCorteCompleto) {
    payload = state.planoCorteCompleto
    console.log('Dados recuperados via history.state (Novo Formato)')
  } 
  // 2. Tenta recuperar o novo formato do localStorage
  else {
    const saved = localStorage.getItem('planoCorteCompleto')
    if (saved) {
      try {
        payload = JSON.parse(saved)
        console.log('Dados recuperados via localStorage (Novo Formato)')
      } catch (e) {
        console.error('Erro ao ler localStorage', e)
      }
    }
  }

  // Se encontrou o novo formato
  if (payload) {
    // Mapeia 'lotes' da tela anterior para 'materiais' do componente de corte
    // Garante que tenha width/height caso o componente precise desses nomes específicos
    materiais.value = (payload.lotes || []).map((m: any) => ({
      ...m,
      width: m.largura || m.width,
      height: m.comprimento || m.height
    }))
    
    // Mapeia 'ops' e cria a estrutura 'cortes' se ela não existir
    ops.value = (payload.ops || []).map((op: any) => {
      // Se já tiver a estrutura de cortes (formato antigo ou já processado), mantém
      if (op.cortes && Array.isArray(op.cortes)) return op

      // Se não tiver, cria o array 'cortes' usando as dimensões da própria OP
      return {
        ...op,
        cortes: [
          {
            width: op.largura_corte || 0,
            height: op.comprimento_corte || 0,
            quantidade: op.qtd || 1,
            // Metadados úteis para o visualizador
            label: `OP ${op.cod_op}`,
            id: op.cod_op
          }
        ]
      }
    })
    
    // Guarda informações do produto pai (caso o componente precise saber qual é o material genérico)
    produtoBase.value = payload.material || null

    console.log(`Carregado: ${materiais.value.length} materiais e ${ops.value.length} OPs processadas`)
  } 
  // Fallback para o formato antigo (caso haja cache antigo ou acesso direto incorreto)
  else {
    const oldSaved = localStorage.getItem('planoCorte')
    if (oldSaved) {
      try {
        const oldPayload = JSON.parse(oldSaved)
        materiais.value = oldPayload.materiais || []
        ops.value = oldPayload.ops || []
        console.warn('Usando formato antigo de dados (planoCorte).')
      } catch (e) {
        console.error('Erro ao ler formato antigo', e)
      }
    } else {
      console.warn('Nenhum dado de corte encontrado. O componente iniciará vazio.')
    }
  }
})
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>