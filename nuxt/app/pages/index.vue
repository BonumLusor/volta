<template>
  <div class="erp-container">
    <div class="erp-content">
      <header class="erp-header">
        <div class="title-group">
          <h1 class="erp-title">Configuração de Lote de Corte</h1>
          <p class="erp-subtitle">Selecione as matérias-primas e as ordens de produção para o plano.</p>
        </div>
        
        <button 
          class="btn-primary" 
          :disabled="!podeConfirmar"
          @click="confirmarEIrParaCorte"
        >
          CONFIRMAR E GERAR PLANO ({{ resumoSelecao }})
        </button>
      </header>

      <div class="main-grid">
        <!-- Coluna de Rolos -->
        <section class="column card">
          <div class="card-header">
            <h2 class="card-title">1. Materiais (Rolos)</h2>
            <span class="count-badge">{{ rolosSelecionados.length }}</span>
          </div>
          <div class="card-body no-padding scroll-area">
            <table class="erp-table">
              <thead>
                <tr>
                  <th>Seleção</th>
                  <th>Material</th>
                  <th>Dimensões</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="rolo in listaRolos" 
                  :key="rolo.id"
                  :class="{ selected: rolosSelecionados.find(r => r.id === rolo.id) }"
                  @click="toggleRolo(rolo)"
                >
                  <td class="text-center">
                    <input type="checkbox" :checked="!!rolosSelecionados.find(r => r.id === rolo.id)" @click.stop />
                  </td>
                  <td><strong>{{ rolo.nome }}</strong></td>
                  <td>{{ rolo.largura }} x {{ rolo.comprimento }} mm</td>
                  <td>
                    <span v-if="rolo.cortesExistentes.length > 0" class="status-tag occupied">Cortado</span>
                    <span v-else class="status-tag available">Novo</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Coluna de OPs -->
        <section class="column card">
          <div class="card-header">
            <h2 class="card-title">2. Ordens de Produção (OPs)</h2>
            <span class="count-badge">{{ opsSelecionadas.length }}</span>
          </div>
          <div class="card-body no-padding scroll-area">
            <table class="erp-table">
              <thead>
                <tr>
                  <th>Seleção</th>
                  <th>OP</th>
                  <th>Cliente</th>
                  <th>Cortes</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="op in opsDisponiveis" 
                  :key="op.id"
                  :class="{ selected: opsSelecionadas.find(o => o.id === op.id) }"
                  @click="toggleOP(op)"
                >
                  <td class="text-center">
                    <input type="checkbox" :checked="!!opsSelecionadas.find(o => o.id === op.id)" @click.stop />
                  </td>
                  <td><strong>#{{ op.id }}</strong></td>
                  <td>{{ op.cliente }}</td>
                  <td>{{ op.cortes.length }} itens</td>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Dados Mockados seguindo a nova estrutura
const listaRolos = ref([
  { 
    id: 'R1', 
    nome: 'Bobina Master 1200', 
    largura: 1200, 
    comprimento: 5000, 
    cortesExistentes: [
      { x: 0, y: 0, width: 1200, height: 200, op: 'FIXO', color: '#94a3b8', fixed: true }
    ] 
  },
  { 
    id: 'R2', 
    nome: 'Retalho A', 
    largura: 400, 
    comprimento: 800, 
    cortesExistentes: [] 
  },
  { 
    id: 'R3', 
    nome: 'Bobina Kraft 900', 
    largura: 900, 
    comprimento: 3000, 
    cortesExistentes: [
      { x: 0, y: 0, width: 400, height: 400, op: 'FIXO', color: '#94a3b8', fixed: true }
    ] 
  },
])

const opsDisponiveis = ref([
  { 
    id: 2134, 
    cliente: 'Indústria Metal', 
    cortes: [
      { width: 300, height: 400, color: '#3b82f6' },
      { width: 200, height: 200, color: '#3b82f6' }
    ]
  },
  { 
    id: 543, 
    cliente: 'Logística Express', 
    cortes: [
      { width: 500, height: 300, color: '#ef4444' }
    ]
  },
  { 
    id: 2033, 
    cliente: 'Tech Solutions', 
    cortes: [
      { width: 150, height: 150, color: '#10b981' },
      { width: 150, height: 150, color: '#10b981' },
      { width: 150, height: 150, color: '#10b981' }
    ]
  }
])

// Estados de Seleção
const rolosSelecionados = ref<any[]>([])
const opsSelecionadas = ref<any[]>([])

// Lógica de UI
const podeConfirmar = computed(() => rolosSelecionados.value.length > 0 && opsSelecionadas.value.length > 0)
const resumoSelecao = computed(() => `${rolosSelecionados.value.length} Rolos, ${opsSelecionadas.value.length} OPs`)

const toggleRolo = (rolo: any) => {
  const index = rolosSelecionados.value.findIndex(r => r.id === rolo.id)
  if (index > -1) rolosSelecionados.value.splice(index, 1)
  else rolosSelecionados.value.push(rolo)
}

const toggleOP = (op: any) => {
  const index = opsSelecionadas.value.findIndex(o => o.id === op.id)
  if (index > -1) opsSelecionadas.value.splice(index, 1)
  else opsSelecionadas.value.push(op)
}

const confirmarEIrParaCorte = () => {
  // Preparamos o payload para a página de corte
  const payload = {
    materiais: rolosSelecionados.value,
    ops: opsSelecionadas.value
  }

  // Salva no localStorage para garantir persistência entre páginas no Nuxt
  if (typeof window !== 'undefined') {
    localStorage.setItem('planoCorte', JSON.stringify(payload))
  }

  router.push({
    path: '/corte',
    state: { planoCorte: payload }
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

.main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
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
  max-height: 60vh;
  overflow-y: auto;
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
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  text-transform: uppercase;
}

.status-tag.occupied {
  background: #fee2e2;
  color: #dc3545;
}

.status-tag.available {
  background: #dcfce7;
  color: #15803d;
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
