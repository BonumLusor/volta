<template>
  <div class="seletor-container">
    <header class="header">
      <div class="title-group">
        <h1>Configuração de Lote de Corte</h1>
        <p>Selecione as matérias-primas e as ordens de produção para o plano.</p>
      </div>
      
      <button 
        class="btn-confirm" 
        :disabled="!podeConfirmar"
        @click="confirmarEIrParaCorte"
      >
        Confirmar e Gerar Plano ({{ resumoSelecao }})
      </button>
    </header>

    <div class="grid-layout">
      <section class="column">
        <h2 class="column-title">1. Materiais (Rolos)</h2>
        <div class="scroll-area">
          <label 
            v-for="rolo in listaRolos" 
            :key="rolo.id" 
            class="card-selectable"
            :class="{ 'is-active': rolosSelecionados.find(r => r.id === rolo.id) }"
          >
            <input type="checkbox" :value="rolo" v-model="rolosSelecionados" class="hidden-check" />
            <div class="card-content">
              <span class="card-tag" v-if="rolo.cortesExistentes.length > 0">Ocupado</span>
              <div class="card-main">
                <span class="card-icon">🌀</span>
                <div>
                  <div class="card-name">{{ rolo.nome }}</div>
                  <div class="card-sub">{{ rolo.largura }}x{{ rolo.comprimento }}mm</div>
                </div>
              </div>
            </div>
          </label>
        </div>
      </section>

      <section class="column">
        <h2 class="column-title">2. Ordens de Produção (OPs)</h2>
        <div class="scroll-area">
          <label 
            v-for="op in opsDisponiveis" 
            :key="op.id" 
            class="card-selectable"
            :class="{ 'is-active': opsSelecionadas.find(o => o.id === op.id) }"
          >
            <input type="checkbox" :value="op" v-model="opsSelecionadas" class="hidden-check" />
            <div class="card-content">
              <div class="card-main">
                <span class="card-icon">📋</span>
                <div>
                  <div class="card-name">OP #{{ op.id }}</div>
                  <div class="card-sub">{{ op.cliente }}</div>
                </div>
              </div>
            </div>
          </label>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Dados Mockados
const listaRolos = ref([
  { id: 'R1', nome: 'Bobina Master 1200', largura: 1200, comprimento: 5000, cortesExistentes: [{ x0: 0, x1: 200, y0: 0, y1: 100, op: 'FIXO', fixo: true }] },
  { id: 'R2', nome: 'Retalho A', largura: 400, comprimento: 800, cortesExistentes: [] },
  { id: 'R3', nome: 'Bobina Kraft 900', largura: 900, comprimento: 3000, cortesExistentes: [] },
])

const opsDisponiveis = ref([
  { id: 2134, cliente: 'Indústria Metal', material: 'Chapa A' },
  { id: 543, cliente: 'Logística Express', material: 'Chapa A' },
  { id: 2033, cliente: 'Tech Solutions', material: 'Chapa B' },
  { id: 4055, cliente: 'Auto Parts Inc', material: 'Chapa B' }
])

// Estados de Seleção
const rolosSelecionados = ref([])
const opsSelecionadas = ref([])

// Lógica de UI
const podeConfirmar = computed(() => rolosSelecionados.value.length > 0 && opsSelecionadas.value.length > 0)
const resumoSelecao = computed(() => `${rolosSelecionados.value.length} Rolos, ${opsSelecionadas.value.length} OPs`)

const confirmarEIrParaCorte = () => {
  // Consolidamos tudo para a página de corte
  // Aqui você pode enviar os rolos e as OPs separadamente para a página de corte organizar
  const payload = {
    materiais: rolosSelecionados.value,
    demandas: opsSelecionadas.value,
    // Criamos a lista inicial de cortes baseada nos fixos dos rolos selecionados
    listaDeCortes: [
      ...rolosSelecionados.value.flatMap(r => r.cortesExistentes),
      // Adicionamos as OPs sem coordenadas (para o algoritmo calcular depois) ou com default
      ...opsSelecionadas.value.map((op, index) => ({
        op: op.id,
        x0: 300, x1: 500, y0: 10 * index, y1: 100 + (10 * index),
        novo: true
      }))
    ]
  }

  router.push({
    path: '/corte',
    state: { planoCorte: payload }
  })
}
</script>

<style scoped>
.seletor-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #333;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 1.5rem;
}

.btn-confirm {
  background: #2ecc71;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(46, 204, 113, 0.2);
}

.btn-confirm:hover:not(:disabled) {
  background: #27ae60;
  transform: translateY(-2px);
}

.btn-confirm:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  box-shadow: none;
}

.grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.column-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #7f8c8d;
}

.scroll-area {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 10px;
}

/* Custom Checkbox Cards */
.card-selectable {
  display: block;
  cursor: pointer;
}

.hidden-check {
  display: none;
}

.card-content {
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  padding: 1.2rem;
  transition: all 0.2s;
  position: relative;
}

.card-selectable.is-active .card-content {
  border-color: #3498db;
  background: #f0f7ff;
}

.card-main {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.card-icon {
  font-size: 1.5rem;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 8px;
}

.card-name {
  font-weight: bold;
  font-size: 1.05rem;
}

.card-sub {
  font-size: 0.85rem;
  color: #95a5a6;
}

.card-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #f1c40f;
  font-size: 0.65rem;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

/* Custom Scrollbar */
.scroll-area::-webkit-scrollbar { width: 6px; }
.scroll-area::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
</style>