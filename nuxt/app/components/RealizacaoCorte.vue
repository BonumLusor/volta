<template>
  <div class="app-wrapper">
    <div class="erp-content-container">
      
      <!-- BLOCO CONDICIONAL PRINCIPAL -->
      <template v-if="dadosProntos">
        
        <!-- TOOLBAR DE CONFIGURAÇÃO DO LOTE (INTEGRADA AO TOPO) -->
        <div class="lote-config-bar">
          <div class="lote-info-header">
            <span class="lote-badge">REALIZAÇÃO DE CORTE</span>
            <h2 class="lote-title">
              Plano de Corte #{{ planoSelecionado?.cod_plano_corte || 'N/A' }}
            </h2>
            <p style="margin: 0; font-size: 0.8rem; color: #666;">
              Produto: {{ planoSelecionado?.nome_produto || 'Carregando...' }}
            </p>
          </div>

          <div class="lote-inputs-flex" style="align-items: center;">
            <div class="info-item">
              <label>Peças Planejadas</label>
              <div class="highlight-val">{{ pecasPlanejadas.length }}</div>
            </div>
            
            <button @click="confirmarCorteNoBanco" class="btn-salvar" :disabled="salvando">
              {{ salvando ? 'CONFIRMANDO...' : 'CONFIRMAR CORTE' }}
            </button>
          </div>
        </div>

        <!-- COMPONENTE DE CORTE PRINCIPAL (MODO VISUALIZAÇÃO) -->
        <Corte 
          ref="corteComponentRef"
          :materiais-iniciais="materiais" 
          :ops-iniciais="ops" 
          :produto-base="planoSelecionado"
        />
        
      </template>

      <!-- ESTADO DE CARREGAMENTO -->
      <div v-else class="loading-overlay">
        <div class="spinner"></div>
        <p>Buscando layout planejado no banco de dados...</p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// Importação do componente de visualização de corte
import Corte from '../components/Corte.vue'

const router = useRouter()
const corteComponentRef = ref<any>(null)

// Estados reativos
const planoSelecionado = ref<any>(null)
const pecasPlanejadas = ref<any[]>([])
const materiais = ref<any[]>([])
const ops = ref<any[]>([])
const dadosProntos = ref(false)
const salvando = ref(false)

async function confirmarCorteNoBanco() {
  if (pecasPlanejadas.value.length === 0) {
    alert("Nenhuma peça planejada encontrada para este plano.");
    return;
  }

  const confirmou = confirm("Deseja confirmar o corte de todas as peças deste plano?");
  if (!confirmou) return;

  salvando.value = true;
  try {
    const response = await fetch('https://volta.automaportal.com.br/api/confirmar-plano-corte', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cod_plano_corte: planoSelecionado.value.cod_plano_corte,
        cod_colaborador: 1, // Pode substituir pelo ID do usuário logado no ERP
        pecas: pecasPlanejadas.value
      })
    });

    if (response.ok) {
      alert("Corte confirmado e reportado com sucesso!");
      router.push('/'); // Retorna para a listagem ou home
    } else {
      const errorData = await response.json();
      console.error("Erro do servidor:", errorData);
      alert("Falha ao confirmar corte. Verifique o console.");
    }
  } catch (error) {
    console.error("Erro ao salvar:", error);
    alert("Erro de comunicação com o servidor.");
  } finally {
    salvando.value = false;
  }
}

onMounted(async () => {
  try {
    // 1. Tenta recuperar do history state ou localStorage
    const state = window.history.state
    let payload = state?.planoData?.plano_corte;
    
    if (!payload) {
      const saved = localStorage.getItem('planoCorteSelecionado')
      if (saved) payload = JSON.parse(saved).plano_corte;
    }

    if (payload && payload.cod_plano_corte) {
      planoSelecionado.value = payload;

      // 2. Busca as peças no banco (SQL plano_corte_06_lista_pecas_planejadas)
      const res = await fetch(`https://volta.automaportal.com.br/api/mysql/sql/plano_corte_06_lista_pecas_planejadas?cod_plano_corte=${payload.cod_plano_corte}`);
      const data = await res.json();
      
      pecasPlanejadas.value = data;

      // 3. Mapeamento das peças retornadas para reconstruir os Rolos no visualizador
      const rolosMap: Record<string, any> = {};
      
      data.forEach((p: any) => {
        // Se o rolo ainda não existe no mapa, cria-o
        if (!rolosMap[p.cod_rolo]) {
          rolosMap[p.cod_rolo] = {
            id: p.cod_rolo,
            nome: `Rolo ${p.cod_rolo} (Lote: ${p.cod_lote})`,
            largura: 0,
            comprimento: 0,
            cortesExistentes: []
          };
        }
        
        // Ajusta dimensões do rolo de forma dinâmica baseado na posição da peça mais distante
        rolosMap[p.cod_rolo].largura = Math.max(rolosMap[p.cod_rolo].largura, p.x1 + 50);
        rolosMap[p.cod_rolo].comprimento = Math.max(rolosMap[p.cod_rolo].comprimento, p.y1 + 50);

        // Adiciona a peça atual como fixa (para não ser editável na realização)
        rolosMap[p.cod_rolo].cortesExistentes.push({
          x: p.x0,
          y: p.y0,
          width: p.largura,
          height: p.comprimento,
          op: p.cod_op,
          color: '#15803d', // Verde para indicar plano pronto para realização
          fixed: true 
        });
      });

      materiais.value = Object.values(rolosMap);
      ops.value = []; // OPs vazias pois não estamos planejando novas peças, apenas visualizando
      
      dadosProntos.value = true;
    } else {
      alert("Nenhum plano selecionado. Retornando...");
      router.push('/');
    }
  } catch (e) {
    console.error("Erro crítico ao carregar peças do plano:", e);
    alert("Erro ao carregar dados. Verifique a API.");
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
  max-width: 1600px;
  margin: 0 auto;
  padding: 15px;
}

/* BARRA DE CONFIGURAÇÃO (TOOLBAR) INTEGRADA */
.lote-config-bar {
  background: white;
  border: 1px solid #e0e0e0;
  border-bottom: 3px solid #15803d; /* Verde para realização */
  border-radius: 6px 6px 0 0;
  padding: 15px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: -1px; 
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  position: relative;
  z-index: 5;
}

.lote-info-header {
  display: flex;
  flex-direction: column;
}

.lote-badge {
  font-size: 0.65rem;
  font-weight: 900;
  color: #15803d; 
  letter-spacing: 1.2px;
  margin-bottom: 4px;
}

.lote-title {
  margin: 0 0 5px 0;
  font-size: 1.2rem;
  color: #1a1a1a;
  font-weight: 700;
  text-transform: uppercase;
}

.lote-inputs-flex {
  display: flex;
  gap: 25px;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info-item label {
  font-size: 0.7rem;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
}

.highlight-val {
  font-size: 1.2rem;
  font-weight: 800;
  color: #001f3f;
}

.btn-salvar {
  background-color: #15803d;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.btn-salvar:hover:not(:disabled) {
  background-color: #166534;
}

.btn-salvar:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
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
  border-top: 5px solid #15803d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin { 
  to { transform: rotate(360deg); }
}

@media (max-width: 1100px) {
  .lote-config-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}
</style>