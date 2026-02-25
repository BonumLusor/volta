<template>
  <div class="erp-container">
    <div class="erp-content">
      <header class="erp-header">
        <div class="title-group">
          <h1 class="erp-title">Planejamento de Corte</h1>
          <p class="erp-subtitle">
            Produto: <strong>{{ materialSelecionado?.nome_produto || 'Carregando...' }}</strong>
          </p>
        </div>
        
        <button 
          class="btn-primary" 
          :disabled="!podeConfirmar"
          @click="confirmarEIrParaCorte"
        >
          CONFIRMAR ({{ resumoSelecao }})
        </button>
      </header>

      <div class="main-grid">
        <!-- Coluna 1: Saldos (Estoque) -->
        <section class="column card">
          <div class="card-header">
            <h2 class="card-title">1. Lotes Disponíveis (Estoque)</h2>
            <span class="count-badge">{{ listaSaldos.length }}</span>
          </div>
          
          <div class="card-body no-padding scroll-area">
            <div v-if="carregando" class="loading-state">
              Carregando estoque...
            </div>

            <table v-else class="erp-table">
              <thead>
                <tr>
                  <th style="width: 40px;"></th>
                  <th>Lote</th>
                  <th>Armazém</th>
                  <th>Qtd</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="item in listaSaldos" 
                  :key="item.lote" 
                  :class="{ selected: saldosSelecionados.find(s => s.lote === item.lote) }"
                  @click="toggleSaldo(item)"
                >
                  <td class="text-center">
                    <input 
                      type="checkbox" 
                      :checked="!!saldosSelecionados.find(s => s.lote === item.lote)" 
                      @click.stop 
                    />
                  </td>
                  <td>
                    <strong>{{ item.lote || 'S/N' }}</strong>
                    <div v-if="item.largura" style="font-size: 0.75rem; color: #666;">
                      {{ item.largura }} x {{ item.comprimento }}
                    </div>
                  </td>
                  <td>{{ item.armazem || 'Geral' }}</td>
                  <td>
                    <span class="status-tag available">
                      {{ item.saldo }} {{ item.un }}
                    </span>
                  </td>
                </tr>
                <tr v-if="!carregando && listaSaldos.length === 0">
                  <td colspan="4" class="text-center" style="padding: 20px;">
                    Sem saldo.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Coluna 2: Ordens de Produção (Demanda) -->
        <section class="column card">
          <div class="card-header">
            <h2 class="card-title">2. Ordens de Produção (OPs)</h2>
            <span class="count-badge">{{ listaOps.length }}</span>
          </div>
          
          <div class="card-body no-padding scroll-area">
            <div v-if="carregandoOps" class="loading-state">
              Carregando OPs...
            </div>

            <table v-else class="erp-table">
              <thead>
                <tr>
                  <th style="width: 40px;"></th>
                  <th>OP / Pedido</th>
                  <th>Produto / Dimensões</th>
                  <th>Data Entrega</th>
                  <th>Qtd</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="op in listaOps" 
                  :key="op.cod_op" 
                  :class="{ selected: opsSelecionadas.find(o => o.cod_op === op.cod_op) }"
                  @click="toggleOp(op)"
                >
                  <td class="text-center">
                    <input 
                      type="checkbox" 
                      :checked="!!opsSelecionadas.find(o => o.cod_op === op.cod_op)" 
                      @click.stop 
                    />
                  </td>
                  <td>
                    <strong>OP {{ op.cod_op }}</strong>
                    <div v-if="op.cod_pedido" style="font-size: 0.75rem; color: #666;">
                      Ped: {{ op.cod_pedido }}
                    </div>
                  </td>
                  <td>
                    <div style="font-weight: 500; font-size: 0.85rem;">{{ op.produto_final }}</div>
                    <div style="font-size: 0.75rem; color: #666;">
                      {{ op.largura_corte }} x {{ op.comprimento_corte }} mm
                    </div>
                  </td>
                  <td>
                    {{ op.dt_comprometida ? new Date(op.dt_comprometida).toLocaleDateString('pt-BR') : '-' }}
                  </td>
                  <td>
                    <span class="status-tag demand">
                      {{ op.qtd }} {{ op.un || 'UN' }}
                    </span>
                  </td>
                </tr>
                <tr v-if="!carregandoOps && listaOps.length === 0">
                  <td colspan="5" class="text-center" style="padding: 20px;">
                    Nenhuma OP encontrada para este material.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Estados
const materialSelecionado = ref<any>(null)
const listaSaldos = ref<any[]>([])
const saldosSelecionados = ref<any[]>([])
const carregando = ref(true)

const listaOps = ref<any[]>([])
const opsSelecionadas = ref<any[]>([])
const carregandoOps = ref(true)

// Ao montar o componente
onMounted(async () => {
  try {
    // 1. Recupera o material salvo no localStorage
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('planoCorte')
      if (savedData) {
        const parsed = JSON.parse(savedData)
        if (parsed.materiais && parsed.materiais.length > 0) {
          materialSelecionado.value = parsed.materiais[0]
        }
      }
    }

    if (!materialSelecionado.value?.cod_produto) {
      alert('Nenhum material selecionado anteriormente.')
      router.push('/')
      return
    }

    const codProduto = materialSelecionado.value.cod_produto

    // 2. Busca SALDOS em paralelo
    const fetchSaldos = fetch(`https://volta.automaportal.com.br/api/mysql/eq_saldo?cod_produto=${codProduto}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const rawList = Array.isArray(data) ? data : Object.values(data)
        listaSaldos.value = rawList.map((item: any) => {
          let unidadeFormatada = item.un;
          if (unidadeFormatada && (unidadeFormatada === 'M2' || unidadeFormatada === 'm2')) {
            unidadeFormatada = 'm²';
          }
          return {
            ...item,
            lote: item.cod_lote,
            saldo: item.saldo_estoque,
            armazem: item.localizacao || `Depósito ${item.cod_deposito}`,
            un: unidadeFormatada
          }
        })
      })
      .catch(err => console.error('Erro saldos:', err))
      .finally(() => carregando.value = false)

    // 3. Busca OPs em paralelo
    const fetchOps = fetch(`https://volta.automaportal.com.br/api/pp_op_mp_do_produto?cod_produto=${codProduto}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const rawOps = Array.isArray(data) ? data : Object.values(data)
        listaOps.value = rawOps.map((op: any) => ({
          ...op,
          // Mapeamento baseado no JSON fornecido
          cod_op: op.op_cod, 
          cod_pedido: op.cod_pedido,
          produto_final: op.prod_fabricado,
          largura_corte: op.prod_fabricado_largura,
          comprimento_corte: op.prod_fabricado_comprimento,
          qtd: op.op_qtd_total_a_ser_fabricada,
          un: op.prod_fabricado_un,
          dt_comprometida: op.dt_comprometida_pv || op.dt_previsao_termino_op
        }))
      })
      .catch(err => console.error('Erro OPs:', err))
      .finally(() => carregandoOps.value = false)

    await Promise.all([fetchSaldos, fetchOps])

  } catch (error) {
    console.error('Erro geral:', error)
  }
})

// Lógica de UI
const podeConfirmar = computed(() => saldosSelecionados.value.length > 0)

const resumoSelecao = computed(() => {
  const qtdLotes = saldosSelecionados.value.length
  const qtdOps = opsSelecionadas.value.length
  return `${qtdLotes} Lotes, ${qtdOps} OPs`
})

const toggleSaldo = (item: any) => {
  const index = saldosSelecionados.value.findIndex(s => s.lote === item.lote)
  if (index > -1) saldosSelecionados.value.splice(index, 1)
  else saldosSelecionados.value.push(item)
}

const toggleOp = (op: any) => {
  const index = opsSelecionadas.value.findIndex(o => o.cod_op === op.cod_op)
  if (index > -1) opsSelecionadas.value.splice(index, 1)
  else opsSelecionadas.value.push(op)
}

const confirmarEIrParaCorte = () => {
  const payload = {
    material: materialSelecionado.value,
    lotes: saldosSelecionados.value,
    ops: opsSelecionadas.value
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('planoCorteCompleto', JSON.stringify(payload))
  }

  router.push({
    path: '/corte',
    state: { planoCorteCompleto: payload }
  })
}
</script>

<style scoped>
.erp-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
}

.erp-content {
  max-width: 1400px; /* Aumentei para caber 2 colunas */
  margin: 0 auto;
}

.erp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.erp-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #001f3f;
  margin: 0;
}

.erp-subtitle {
  font-size: 0.9rem;
  color: #666;
  margin: 5px 0 0 0;
}

/* Grid Layout */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
}

/* Cards */
.card {
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
}

.card-header {
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 0.9rem;
  font-weight: 700;
  margin: 0;
  text-transform: uppercase;
  color: #444;
}

.card-body.no-padding {
  padding: 0;
}

.scroll-area {
  max-height: 65vh;
  overflow-y: auto;
}

.loading-state {
  padding: 40px;
  text-align: center;
  color: #666;
  font-style: italic;
}

/* Table */
.erp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.erp-table th {
  background: #f8f9fa;
  text-align: left;
  padding: 12px 15px;
  border-bottom: 2px solid #dee2e6;
  color: #666;
  position: sticky;
  top: 0;
  z-index: 10;
}

.erp-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
}

.erp-table tr:hover {
  background-color: #fcfcfc;
  cursor: pointer;
}

.erp-table tr.selected {
  background-color: #fff4ed;
}

.text-center {
  text-align: center;
}

/* Status Tags */
.status-tag {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 4px;
  text-transform: uppercase;
}

.status-tag.available {
  background: #e0f2fe;
  color: #0284c7;
  border: 1px solid #bae6fd;
}

.status-tag.demand {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
}

/* Buttons */
.btn-primary {
  background-color: #001f3f;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #003366;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.count-badge {
  background: #f37021;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700; 
}
</style>