<template>
  <div class="app-wrapper">
    <div class="erp-content-container">
      
      <!-- BLOCO CONDICIONAL PRINCIPAL (Resolve o erro do v-else) -->
      <template v-if="dadosProntos">
        
        <!-- TOOLBAR DE CONFIGURAÇÃO DO LOTE (INTEGRADA AO TOPO) -->
        <div class="lote-config-bar">
          <div class="lote-info-header">
            <span class="lote-badge">AJUSTE DE MATÉRIA-PRIMA</span>
            <h2 class="lote-title">
              {{ produtoBase?.nome_produto || 'Material Selecionado' }}
            </h2>
            
            <button @click="salvarPlanoNoBanco" class="btn-salvar">FINALIZAR E SALVAR</button>
          </div>

          <div class="lote-inputs-flex">
            <!-- Itera sobre os materiais caso haja mais de um lote selecionado -->
            <div v-for="mat in materiais" :key="mat.id" class="input-item">
              <label>Lote: <strong>{{ mat.nome }}</strong></label>
              <div class="input-pair">
                <div class="field">
                  <span class="field-label">LARGURA (mm)</span>
                  <input 
                    type="number" 
                    v-model.number="mat.largura" 
                    title="Largura da chapa/bobina"
                  />
                </div>
                <div class="field-separator"></div>
                <div class="field">
                  <span class="field-label">COMPRIMENTO (mm)</span>
                  <input 
                    type="number" 
                    v-model.number="mat.comprimento" 
                    title="Comprimento da chapa/bobina"
                  />
                </div><area
              </div>
            </div>
          </div>
        </div>

        <!-- COMPONENTE DE CORTE PRINCIPAL -->
        <Corte 
          ref="corteComponentRef"
          :materiais-iniciais="materiais" 
          :ops-iniciais="ops" 
          :produto-base="produtoBase"
        />
        
      </template>

      <!-- ESTADO DE CARREGAMENTO (Sempre adjacente ao v-if/template) -->
      <div v-else class="loading-overlay">
        <div class="spinner"></div>
        <p>Sincronizando dados de produção...</p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
// Importação conforme solicitado
import Corte from '../components/Corte.vue'


const corteComponentRef = ref<any>(null)

// Estados reativos
const materiais = ref<any[]>([])
const ops = ref<any[]>([])
const produtoBase = ref<any>(null)
const dadosProntos = ref(false)

async function salvarPlanoNoBanco() {
  // Verificação de segurança
  if (!corteComponentRef.value) {
    console.error("Componente Corte não foi carregado.");
    return;
  }

  try {
    // Agora o getPlanoProcessado deve ser reconhecido
    const dadosDoCorte = corteComponentRef.value.getPlanoProcessado();
    
    if (!dadosDoCorte || dadosDoCorte.pecas.length === 0) {
      alert("Desenhe ou adicione cortes antes de salvar.");
      return;
    }

    console.log("Enviando para o banco:", dadosDoCorte);
    
    // Aqui vai o seu fetch para a API (URL da sua API Node)
    const response = await fetch('https://volta.automaportal.com.br/api/salvar-plano-corte', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metadata: {
           cod_plano_corte: 1, // Pegar do seu estado/localStorage
           cod_colaborador: 1,
           cod_empresa: 1,
           cod_produto: 'MP001'
        },
        pecas: dadosDoCorte.pecas
      })
    });

    if (response.ok) alert("Salvo com sucesso!");

  } catch (error) {
    console.error("Erro ao salvar:", error);
  }
}

onMounted(() => {
  let payload: any = null

  try {
    // 1. Tenta recuperar do history state (navegação via router)
    const state = window.history.state
    if (state && state.planoCorteCompleto) {
      payload = JSON.parse(JSON.stringify(state.planoCorteCompleto))
    } 
    // 2. Fallback para localStorage (persistência)
    else {
      const saved = localStorage.getItem('planoCorteCompleto')
      if (saved) payload = JSON.parse(saved)
    }

    if (payload) {
      // Mapeamento dos Materiais (Lotes) conforme resposta da API
      materiais.value = (payload.lotes || []).map((m: any) => ({
        ...m,
        id: m.cod_lote || m.id,
        nome: m.lote || m.cod_lote || `LOTE`,
        largura: Number(m.largura || 0),
        comprimento: Number(m.comprimento || 0),
        cortesExistentes: m.cortesExistentes || []
      }))

      // Mapeamento das OPs (Ordens de Produção)
      ops.value = (payload.ops || []).map((op: any) => {
        const opId = op.op_cod || op.cod_op || op.id;
        const prodNome = op.prod_fabricado || op.produto_final || 'Produto';
        
        return {
          ...op,
          id: opId,
          produto: prodNome,
          // Estrutura de cortes necessária para o componente Canvas
          cortes: op.cortes || [{
            width: Number(op.prod_fabricado_largura || op.largura_corte || 0),
            height: Number(op.prod_fabricado_comprimento || op.comprimento_corte || 0),
            quantidade: Number(op.op_qtd_total_a_ser_fabricada || op.qtd || 1),
            color: '#3b82f6',
            label: `OP ${opId} - ${prodNome}`
          }]
        }
      })
      
      produtoBase.value = payload.material || null
      dadosProntos.value = true
    }
  } catch (e) {
    console.error("Erro crítico ao carregar plano de corte:", e)
  }
})
</script>

<style scoped>
/* Reset e Container */
.app-wrapper {
  background-color: #f5f5f5;
  min-height: 100vh;
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.erp-content-container {
  margin: 0 auto;
  padding: 15px;
}

/* BARRA DE CONFIGURAÇÃO (TOOLBAR) INTEGRADA */
.lote-config-bar {
  background: white;
  border: 1px solid #e0e0e0;
  border-bottom: 3px solid #001f3f; /* Azul Marinho ERP */
  border-radius: 6px 6px 0 0;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: -1px; /* Faz "colar" no componente de baixo */
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  position: relative;
  z-index: 5;
}

.lote-info-header {
  display: flex;
  flex-direction: column;
}

.lote-badge {
  font-size: 0.6rem;
  font-weight: 900;
  color: #f37021; /* Laranja de destaque */
  letter-spacing: 1.2px;
  margin-bottom: 2px;
}

.lote-title {
  margin: 0;
  font-size: 0.95rem;
  color: #1a1a1a;
  font-weight: 700;
  text-transform: uppercase;
}

.lote-inputs-flex {
  display: flex;
  gap: 25px;
}

.input-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-item label {
  font-size: 0.7rem;
  color: #666;
  font-weight: 600;
}

.input-pair {
  display: flex;
  background: #ffffff;
  border: 1px solid #c1c1c1;
  border-radius: 4px;
  align-items: center;
  overflow: hidden;
}

.field {
  display: flex;
  align-items: center;
  padding: 4px 10px;
  background: #fdfdfd;
}

.field-label {
  font-size: 0.6rem;
  font-weight: 800;
  color: #999;
  margin-right: 8px;
  white-space: nowrap;
}

.field input {
  border: none;
  background: transparent;
  width: 80px;
  font-size: 0.9rem;
  font-weight: 700;
  color: #001f3f;
  padding: 2px 0;
  text-align: right;
}

.field input:focus {
  outline: none;
}

.field-separator {
  width: 1px;
  height: 20px;
  background-color: #e0e0e0;
}

/* Remover setas padrão dos inputs numéricos */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
}

/* ESTADO DE CARREGAMENTO */
.loading-overlay {
  height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
}

.spinner {
  width: 45px;
  height: 45px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #001f3f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin { 
  to { transform: rotate(360deg); }
}

</style>