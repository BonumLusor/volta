<template>
  <div class="erp-container">
    <div class="erp-content">
      <div class="tabs-section">
        <div class="tabs-navigation">
          <button 
            v-for="(rolo, index) in materiais" 
            :key="index"
            class="erp-tab"
            :class="{ active: currentRollIndex === index }"
            @click="currentRollIndex = index"
          >
            {{ rolo.nome || 'ROLO ' + (index + 1) }}
          </button>
        </div>
        <div class="tabs-actions">
          <button class="btn-primary" @click="addCorrectionCut">ADICIONAR CORREÇÃO</button>
          <button class="btn-success" @click="finalizarRealizacao" style="margin-left: 10px;">FINALIZAR</button>
        </div>
      </div>

      <div class="main-grid">
        <section class="canvas-section card">
          <div class="card-header">
            <h2 class="card-title">Execução Real: {{ materiais[currentRollIndex]?.nome }}</h2>
          </div>
          <div class="canvas-viewport">
            <div class="canvas-container" :style="{ width: displaySize.width + 'px', height: displaySize.height + 'px' }">
              <canvas ref="canvasRef" @mousedown="handleSelect"></canvas>
            </div>
          </div>
        </section>

        <aside class="side-panel">
          <div class="card properties-card">
            <div class="card-header">
              <h2 class="card-title">Ajuste de Medida Real</h2>
            </div>
            <div class="card-body">
              <div v-if="selectedIndex !== -1" class="property-form">
                <div class="op-badge" :class="{ 'correction-badge': rectangles[selectedIndex]?.isCorrection }">
                  OP #{{ rectangles[selectedIndex]?.op }}
                  <span v-if="rectangles[selectedIndex]?.isCorrection"> (CORREÇÃO)</span>
                </div>
                
                <div class="form-grid">
                  <div class="form-group full-width">
                    <label>Largura Real (mm)</label>
                    <input type="number" v-model.number="editValues.width" @input="updateRectangle" class="erp-input real-input" />
                  </div>
                  <div class="form-group full-width">
                    <label>Altura Real (mm)</label>
                    <input type="number" v-model.number="editValues.height" @input="updateRectangle" class="erp-input real-input" />
                  </div>
                  <div class="form-group">
                    <label>X (Posição)</label>
                    <input type="number" v-model.number="editValues.x" @input="updateRectangle" class="erp-input" />
                  </div>
                  <div class="form-group">
                    <label>Y (Posição)</label>
                    <input type="number" v-model.number="editValues.y" @input="updateRectangle" class="erp-input" />
                  </div>
                  <div class="form-group full-width">
                    <label>Transferir para Rolo</label>
                    <select v-model.number="editValues.roloId" @change="transferirRolo" class="erp-input">
                      <option v-for="(rolo, idx) in materiais" :key="idx" :value="idx">
                        {{ rolo.nome || 'ROLO ' + (idx + 1) }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="form-actions">
                  <button v-if="rectangles[selectedIndex]?.isCorrection" @click="deleteRectangle" class="btn-danger">REMOVER</button>
                  <button @click="deselectRectangle" class="btn-secondary">FECHAR</button>
                </div>
              </div>
              <div v-else class="empty-state">
                <p>Selecione um corte para informar as medidas reais obtidas na máquina.</p>
              </div>
            </div>
          </div>

          <div class="card list-card">
            <div class="card-header">
              <h2 class="card-title">Relatório de Cortes</h2>
            </div>
            <div class="card-body no-padding">
              <div class="table-container">
                <table class="erp-table">
                  <thead>
                    <tr>
                      <th>OP</th>
                      <th>Planejado</th>
                      <th>Real</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="(rect, index) in rectangles" 
                      :key="index"
                      v-show="rect.roloId === currentRollIndex"
                      :class="{ selected: selectedIndex === index, 'is-correction': rect.isCorrection }"
                      @click="selectRectangle(index)"
                    >
                      <td><strong>{{ rect.op }}</strong></td>
                      <td>{{ rect.plannedWidth }}x{{ rect.plannedHeight }}</td>
                      <td :class="{ 'has-diff': rect.width !== rect.plannedWidth || rect.height !== rect.plannedHeight }">
                        {{ rect.width }}x{{ rect.height }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed } from 'vue'

interface Rectangle {
  x: number; y: number; width: number; height: number;
  plannedWidth: number; plannedHeight: number;
  color: string; op: string | number; roloId: number;
  fixed?: boolean; isCorrection?: boolean;
}

const props = defineProps<{
  materiaisIniciais: any[],
  cortesPlanejados: any[]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const materiais = ref(props.materiaisIniciais || [])
const rectangles = ref<Rectangle[]>([])
const currentRollIndex = ref(0)
const selectedIndex = ref(-1)
const editValues = ref({ x: 0, y: 0, width: 0, height: 0 })

const currentRoll = computed(() => materiais.value[currentRollIndex.value])
const scaleFactor = computed(() => {
  if (!currentRoll.value) return 1
  const maxDim = Math.max(currentRoll.value.largura, currentRoll.value.comprimento)
  return maxDim > 800 ? 800 / maxDim : 1
})

const displaySize = computed(() => ({
  width: currentRoll.value ? currentRoll.value.largura * scaleFactor.value : 600,
  height: currentRoll.value ? currentRoll.value.comprimento * scaleFactor.value : 800
}))

onMounted(async () => {
  await nextTick()
  if (props.cortesPlanejados) {
    rectangles.value = props.cortesPlanejados.map(c => ({
      ...c,
      plannedWidth: c.width,
      plannedHeight: c.height
    }))
  }
  initCanvas()
})

function initCanvas() {
  if (canvasRef.value && currentRoll.value) {
    canvasRef.value.width = displaySize.value.width
    canvasRef.value.height = displaySize.value.height
    draw()
  }
}

watch(currentRollIndex, () => { selectedIndex.value = -1; initCanvas(); })
watch(rectangles, () => draw(), { deep: true })

function draw() {
  if (!canvasRef.value || !currentRoll.value) return
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return
  const s = scaleFactor.value
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  rectangles.value.forEach((rect, index) => {
    if (rect.roloId !== currentRollIndex.value) return
    const dx = rect.x * s, dy = rect.y * s, dw = rect.width * s, dh = rect.height * s
    
    ctx.fillStyle = rect.fixed ? '#e2e8f0' : rect.color
    ctx.globalAlpha = 0.6
    ctx.fillRect(dx, dy, dw, dh)
    ctx.globalAlpha = 1.0
    
    const isSelected = selectedIndex.value === index
    ctx.strokeStyle = isSelected ? '#f37021' : '#333'
    ctx.lineWidth = isSelected ? 3 : 1
    ctx.strokeRect(dx, dy, dw, dh)
    
    ctx.fillStyle = '#000'
    ctx.font = `bold ${12 * s}px sans-serif`
    ctx.fillText(`${rect.op}`, dx + 5, dy + 15)
  })
}

function handleSelect(e: MouseEvent) {
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const s = scaleFactor.value
  const mx = (e.clientX - rect.left) / s, my = (e.clientY - rect.top) / s
  
  selectedIndex.value = rectangles.value.findLastIndex(r => 
    r.roloId === currentRollIndex.value && mx >= r.x && mx <= r.x + r.width && my >= r.y && my <= r.y + r.height
  )
  if (selectedIndex.value !== -1) {
    editValues.value = { ...rectangles.value[selectedIndex.value] }
  }
}

function updateRectangle() {
  if (selectedIndex.value !== -1) {
    const r = rectangles.value[selectedIndex.value]
    Object.assign(r, editValues.value)
    
    // Ajustar cor baseada na OP
    if (r.op === -1) r.color = '#94a3b8' // Descarte
    else if (r.op === 0) r.color = '#8b5cf6' // Rolo Filho
    else if (r.op === 'CORREÇÃO') r.color = '#f59e0b'
  }
}

function transferirRolo() {
  if (selectedIndex.value !== -1) {
    const r = rectangles.value[selectedIndex.value]
    const novoRoloIdx = editValues.value.roloId
    r.roloId = novoRoloIdx
    r.x = 0
    r.y = 0
    currentRollIndex.value = novoRoloIdx
    draw()
  }
}

function addCorrectionCut() {
  const newCut: Rectangle = {
    x: 10, y: 10, width: 100, height: 100,
    plannedWidth: 100, plannedHeight: 100,
    color: '#f59e0b', op: 'CORREÇÃO',
    roloId: currentRollIndex.value, isCorrection: true
  }
  rectangles.value.push(newCut)
  selectedIndex.value = rectangles.value.length - 1
  editValues.value = { ...newCut }
}

function deleteRectangle() {
  if (selectedIndex.value !== -1 && rectangles.value[selectedIndex.value].isCorrection) {
    rectangles.value.splice(selectedIndex.value, 1)
    selectedIndex.value = -1
  }
}

function deselectRectangle() { selectedIndex.value = -1 }
function selectRectangle(index: number) { 
  selectedIndex.value = index
  editValues.value = { ...rectangles.value[index] }
}

function finalizarRealizacao() {
  alert('Cortes finalizados e registrados no sistema!')
  console.log('Dados finais:', rectangles.value)
}
</script>

<style scoped>
.erp-container { width: 100%; min-height: 100vh; background-color: #f8f9fa; font-family: sans-serif; }
.erp-content { padding: 20px; max-width: 1400px; margin: 0 auto; }
.tabs-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #dee2e6; }
.tabs-navigation { display: flex; gap: 5px; }
.erp-tab { padding: 10px 20px; border: none; background: transparent; font-weight: 600; cursor: pointer; border-bottom: 3px solid transparent; }
.erp-tab.active { color: #f37021; border-bottom-color: #f37021; }
.main-grid { display: grid; grid-template-columns: 1fr 350px; gap: 20px; }
.card { background: white; border-radius: 4px; border: 1px solid #e0e0e0; display: flex; flex-direction: column; }
.card-header { padding: 12px 15px; border-bottom: 1px solid #f0f0f0; }
.card-title { font-size: 0.9rem; font-weight: 700; text-transform: uppercase; }
.canvas-viewport { flex: 1; background: #f0f0f0; padding: 20px; display: flex; justify-content: center; overflow: auto; }
.canvas-container { position: relative; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
canvas { display: block; cursor: pointer; }
.side-panel { display: flex; flex-direction: column; gap: 20px; }
.property-form { display: flex; flex-direction: column; gap: 15px; padding: 15px; }
.op-badge { background: #f8f9fa; padding: 10px; border-radius: 4px; font-weight: 700; text-align: center; border: 1px solid #ddd; }
.correction-badge { background: #fffbeb; color: #b45309; border-color: #f59e0b; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.full-width { grid-column: span 2; }
.form-group label { font-size: 0.75rem; font-weight: 600; color: #666; }
.erp-input { padding: 10px; border: 1px solid #ccc; border-radius: 4px; width: 100%; box-sizing: border-box; }
.real-input { border-color: #f37021; background: #fff9f5; font-weight: bold; font-size: 1.1rem; }
.btn-primary { background: #001f3f; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
.btn-success { background: #15803d; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
.btn-danger { background: #dc3545; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
.btn-secondary { background: #eee; border: 1px solid #ccc; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
.form-actions { display: flex; gap: 10px; margin-top: 10px; }
.table-container { max-height: 400px; overflow-y: auto; }
.erp-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.erp-table th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; }
.erp-table td { padding: 10px; border-bottom: 1px solid #eee; }
.erp-table tr.selected { background: #fff4ed; }
.has-diff { color: #dc3545; font-weight: bold; }
.is-correction { color: #b45309; font-style: italic; }
</style>