<template>
  <div class="app-wrapper">
    <!-- Componente de Corte recebendo os dados processados -->
    <!-- Adicionado v-if para garantir que só renderiza quando tiver dados processados -->
    <Corte 
      v-if="dadosProntos"
      :materiais-iniciais="materiais" 
      :ops-iniciais="ops" 
      :produto-base="produtoBase"
    />
    <div v-else class="loading">
      Processando dados de corte...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const materiais = ref<any[]>([])
const ops = ref<any[]>([])
const produtoBase = ref<any>(null)
const dadosProntos = ref(false)

onMounted(() => {
  console.log('corte.vue: Iniciando recuperação de dados...')
  
  let payload: any = null

  try {
    // 1. Tenta recuperar do history.state (Prioridade Alta)
    // USAMOS JSON.parse/stringify PARA REMOVER PROXIES DO VUE QUE CAUSAM ERRO DE CLONE
    const state = window.history.state
    if (state && state.planoCorteCompleto) {
      payload = JSON.parse(JSON.stringify(state.planoCorteCompleto))
      console.log('corte.vue: Dados encontrados no history.state (Deep Cloned)')
    } 
    // 2. Tenta recuperar do localStorage (Prioridade Média)
    else {
      const saved = localStorage.getItem('planoCorteCompleto')
      if (saved) {
        payload = JSON.parse(saved)
        console.log('corte.vue: Dados encontrados no localStorage')
      }
    }

    // 3. Fallback para formato antigo (Prioridade Baixa)
    if (!payload) {
      const oldSaved = localStorage.getItem('planoCorte')
      if (oldSaved) {
        const oldPayload = JSON.parse(oldSaved)
        payload = {
          lotes: oldPayload.materiais,
          ops: oldPayload.ops,
          material: null
        }
        console.warn('corte.vue: Usando formato antigo como fallback.')
      }
    }

    // Processamento dos dados
    if (payload) {
      // --- Mapeamento de Materiais (Lotes) ---
      const rawLotes = payload.lotes || payload.materiais || []
      
      materiais.value = rawLotes.map((m: any) => ({
        ...m,
        width: Number(m.largura || m.width || 0),
        height: Number(m.comprimento || m.height || 0),
        id: m.cod_lote || m.id || `lote-${Math.random().toString(36).substr(2, 9)}`,
        label: m.lote || m.nome || 'Lote sem nome'
      }))

      // --- Mapeamento de OPs ---
      const rawOps = payload.ops || []
      
      ops.value = rawOps.map((op: any) => {
        // Cria uma cópia limpa do objeto OP
        const newOp = { ...op }

        // Verifica se 'cortes' existe e é um array válido
        const temCortesValidos = Array.isArray(newOp.cortes) && newOp.cortes.length > 0

        if (!temCortesValidos) {
          // SE NÃO TIVER CORTES, CRIA A ESTRUTURA BASEADA NAS DIMENSÕES DA OP
          // Isso corrige o erro "op.cortes is undefined"
          newOp.cortes = [
            {
              width: Number(op.largura_corte || op.width || 0),
              height: Number(op.comprimento_corte || op.height || 0),
              quantidade: Number(op.qtd || 1),
              label: `OP ${op.cod_op || op.id || '?'}`,
              id: op.cod_op || op.id,
              cor: op.cor || '#1976d2'
            }
          ]
        } 
        // Se já tem cortes, garantimos que seja um array (sanity check)
        else if (!Array.isArray(newOp.cortes)) {
           newOp.cortes = []
        }

        return newOp
      })
      
      produtoBase.value = payload.material || null

      console.log(`corte.vue: Sucesso -> ${materiais.value.length} Materiais, ${ops.value.length} OPs.`)
      
      // Habilita a renderização do componente filho apenas agora que os dados estão higienizados
      dadosProntos.value = true

    } else {
      console.warn('corte.vue: Nenhum dado encontrado (Payload nulo).')
    }
  } catch (error) {
    console.error('corte.vue: Erro crítico ao processar dados:', error)
  }
})
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  background-color: #f5f5f5;
}
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.2rem;
  color: #666;
}
</style>