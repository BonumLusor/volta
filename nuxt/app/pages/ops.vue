<template>
  <div class="erp-container">
    <div class="erp-content">
      <header class="erp-header">
        <div class="title-group">
          <h1 class="erp-title">Seleção de Lotes em Estoque</h1>
          <p class="erp-subtitle">
            Produto selecionado: <strong>{{ materialSelecionado?.nome_produto || 'Carregando...' }}</strong>
          </p>
        </div>
        
        <button 
          class="btn-primary" 
          :disabled="!podeConfirmar"
          @click="confirmarEIrParaCorte"
        >
          Selecionar OP's ({{ resumoSelecao }})
        </button>
      </header>

      <div class="">
        <!-- Coluna Única de Saldos -->
        <section class="column card">
          <div class="card-header">
            <h2 class="card-title">Lotes Disponíveis (Saldo)</h2>
            <span class="count-badge">{{ listaSaldos.length }}</span>
          </div>
          
          <div class="card-body no-padding scroll-area">
            <div v-if="carregando" class="loading-state">
              Carregando saldos...
            </div>

            <table v-else class="erp-table">
              <thead>
                <tr>
                  <th style="width: 50px;">Seleção</th>
                  <th>Lote / Produto</th>
                  <th>Endereço / Armazém</th>
                  <th>Quantidade Disponível</th>
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
                    <!-- Exibe o nome do produto do lote -->
                    <div v-if="item.produto" style="font-size: 0.85rem; color: #444; margin: 2px 0;">
                      {{ item.produto }}
                    </div>
                    <!-- Exibe dimensões se disponíveis (útil para chapas/rolos) -->
                    <div v-if="item.largura || item.comprimento" style="font-size: 0.8em; color: #666;">
                      {{ item.largura }} x {{ item.comprimento }} mm
                    </div>
                  </td>
                  <td>{{ item.armazem || 'Geral' }}</td>
                  <td>
                    <span class="status-tag available">
                      {{ item.saldo }} {{ item.un || materialSelecionado?.un || 'UN' }}
                    </span>
                  </td>
                </tr>
                <tr v-if="listaSaldos.length === 0">
                  <td colspan="4" class="text-center" style="padding: 20px;">
                    Nenhum saldo encontrado para este produto.
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

// Ao montar o componente, recupera o material da tela anterior e busca os saldos
onMounted(async () => {
  try {
    // 1. Recupera o material salvo no localStorage da tela anterior
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('planoCorte')
      if (savedData) {
        const parsed = JSON.parse(savedData)
        // Assume que 'materiais' é um array e pegamos o primeiro (single select da tela anterior)
        if (parsed.materiais && parsed.materiais.length > 0) {
          materialSelecionado.value = parsed.materiais[0]
        }
      }
    }

    // Se não tiver material selecionado, volta para a home ou exibe erro
    if (!materialSelecionado.value?.cod_produto) {
      alert('Nenhum material selecionado anteriormente.')
      router.push('/') // Ajuste para sua rota inicial
      return
    }

    // 2. Busca os saldos na API usando o cod_produto
    const codProduto = materialSelecionado.value.cod_produto
    const response = await fetch(`https://volta.automaportal.com.br/api/mysql/eq_saldo?cod_produto=${codProduto}`)
    
    if (!response.ok) throw new Error('Erro na API')
    
    const data = await response.json()
    
    // --- CORREÇÃO DE FORMATO ---
    // Transforma o objeto { "0": {...}, "1": {...} } em Array [...]
    // Se já vier array, mantém.
    const rawList = Array.isArray(data) ? data : Object.values(data)

    // Mapeia os campos da API para o formato esperado pelo Template
    listaSaldos.value = rawList.map((item: any) => {
      // Normaliza a unidade: se for M2 ou m2, transforma em m²
      let unidadeFormatada = item.un;
      if (unidadeFormatada && (unidadeFormatada === 'M2' || unidadeFormatada === 'm2')) {
        unidadeFormatada = 'm²';
      }

      return {
        // Importante: espalha o item PRIMEIRO para não sobrescrever as customizações abaixo
        ...item,
        lote: item.cod_lote,
        saldo: item.saldo_estoque,
        // Usa localização se existir, senão usa código do depósito
        armazem: item.localizacao || `Depósito ${item.cod_deposito}`,
        // Define a unidade formatada POR ÚLTIMO
        un: unidadeFormatada,
        // Dados extras para visualização
        largura: item.largura,
        comprimento: item.comprimento
      }
    })
    
    console.log('Saldos formatados:', listaSaldos.value)

  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  } finally {
    carregando.value = false
  }
})

// Lógica de UI
const podeConfirmar = computed(() => saldosSelecionados.value.length > 0)
const resumoSelecao = computed(() => `${saldosSelecionados.value.length} Lotes`)

// Permite selecionar múltiplos lotes para corte (ou mude a lógica se for apenas um por vez)
const toggleSaldo = (item: any) => {
  const index = saldosSelecionados.value.findIndex(s => s.lote === item.lote)
  if (index > -1) saldosSelecionados.value.splice(index, 1)
  else saldosSelecionados.value.push(item)
}

const confirmarEIrParaCorte = () => {
  // Atualiza o payload com os lotes específicos selecionados
  const payload = {
    material: materialSelecionado.value, // O tipo de produto
    lotes: saldosSelecionados.value      // Os rolos/lotes específicos físicos
  }

  // Atualiza o localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('planoCorteCompleto', JSON.stringify(payload))
  }

  // Navega para a próxima etapa
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
  max-width: 1200px;
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

/* Cards */
.card {
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
  width: 100%; /* Força largura total */
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