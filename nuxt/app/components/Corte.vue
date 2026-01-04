<template>
  <div class="erp-container">
    <div class="erp-content">
      <!-- Seção de Abas de Rolos -->
      <div class="tabs-section">
        <div class="tabs-navigation">
          <button 
            v-for="(rolo, index) in materiais" 
            :key="index"
            class="erp-tab"
            :class="{ active: currentRollIndex === index }"
            @click="currentRollIndex = index"
          >
            ROLO {{ index + 1 }} ({{ rolo.largura }}x{{ rolo.comprimento }})
          </button>
        </div>
        <div class="tabs-actions">
          <button class="btn-primary" @click="addRectangle">ADICIONAR CORTE</button>
        </div>
      </div>

      <div class="main-grid">
        <!-- Área do Canvas (Lado Esquerdo/Central) -->
        <section class="canvas-section card">
          <div class="card-header">
            <h2 class="card-title">Visualização do Rolo</h2>
            <div class="card-tools">
              <span class="icon-tool">✏️</span>
              <span class="icon-tool">📎</span>
            </div>
          </div>
          
          <div 
            class="canvas-viewport"
            ref="scrollContainer"
            @scroll="handleScroll"
          >
            <div 
              class="canvas-container"
              :style="{ 
                width: (displaySize.width + 2) + 'px',
                height: (displaySize.height) + 'px'
              }"
            >
              <div v-if="scrollTop > 5" class="wavy-edge top"></div>
              <canvas
                ref="canvasRef"
                @mousedown="handleMouseDown"
                @mousemove="handleMouseMove"
                @mouseup="handleMouseUp"
                @mouseleave="handleMouseUp"
              ></canvas>
              <div v-if="!isAtBottom" class="wavy-edge bottom"></div>
            </div>
          </div>
        </section>

        <!-- Painel de Propriedades e Lista (Lado Direito) -->
        <aside class="side-panel">
          <!-- Card de Propriedades -->
          <div class="card properties-card">
            <div class="card-header">
              <h2 class="card-title">Propriedades do Corte</h2>
            </div>
            <div class="card-body">
              <div v-if="selectedIndex !== -1" class="property-form">
                <div class="op-badge">OP #{{ rectangles[selectedIndex]?.op }}</div>
                
                <div class="form-grid">
                  <div class="form-group">
                    <label>X (mm)</label>
                    <input type="number" v-model.number="editValues.x" @input="updateRectangle" class="erp-input" />
                  </div>
                  <div class="form-group">
                    <label>Y (mm)</label>
                    <input type="number" v-model.number="editValues.y" @input="updateRectangle" class="erp-input" />
                  </div>
                  <div class="form-group">
                    <label>Largura</label>
                    <input type="number" v-model.number="editValues.width" @input="updateRectangle" class="erp-input" />
                  </div>
                  <div class="form-group">
                    <label>Altura</label>
                    <input type="number" v-model.number="editValues.height" @input="updateRectangle" class="erp-input" />
                  </div>
                </div>

                <div class="form-actions">
                  <button @click="deleteRectangle" class="btn-danger">EXCLUIR</button>
                  <button @click="deselectRectangle" class="btn-secondary">FECHAR</button>
                </div>
              </div>
              <div v-else class="empty-state">
                <p>Selecione um corte no visualizador para editar suas propriedades.</p>
              </div>
            </div>
          </div>

          <!-- Card de Lista de Cortes -->
          <div class="card list-card">
            <div class="card-header">
              <h2 class="card-title">Cortes no Rolo Atual</h2>
              <span class="count-badge">{{ rectangles.filter(r => r.roloId === currentRollIndex).length }}</span>
            </div>
            <div class="card-body no-padding">
              <table class="erp-table">
                <thead>
                  <tr>
                    <th>OP</th>
                    <th>Dimensões</th>
                    <th>Posição</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="(rect, index) in rectangles" 
                    :key="index"
                    v-show="rect.roloId === currentRollIndex"
                    :class="{ selected: selectedIndex === index }"
                    @click="selectRectangle(index)"
                  >
                    <td><strong>{{ rect.op }}</strong></td>
                    <td>{{ rect.width }} x {{ rect.height }}</td>
                    <td>{{ rect.x.toFixed(0) }}, {{ rect.y.toFixed(0) }}</td>
                    <td>
                      <button class="icon-btn delete" @click.stop="deleteRectangleAtIndex(index)">🗑️</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed } from 'vue'

interface Material {
  id: number
  largura: number
  comprimento: number
}

interface Rectangle {
  x: number
  y: number
  width: number
  height: number
  color: string
  op: string | number
  roloId: number
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const scrollContainer = ref<HTMLElement | null>(null)

const materiais = ref<Material[]>([
  { id: 0, largura: 1200, comprimento: 3000 },
  { id: 1, largura: 800, comprimento: 5000 },
  { id: 2, largura: 1500, comprimento: 1500 }
])
const rectangles = ref<Rectangle[]>([])
const currentRollIndex = ref(0)

const MAX_DISPLAY_DIM = 1000
const snapThreshold = 15

let draggingIndex = -1
let offsetX = 0
let offsetY = 0

const selectedIndex = ref(-1)
const editValues = ref({ x: 0, y: 0, width: 0, height: 0, color: '', roloId: 0 })

const scrollTop = ref(0)
const isAtBottom = ref(false)

const currentRoll = computed(() => materiais.value[currentRollIndex.value])

const scaleFactor = computed(() => {
  if (!currentRoll.value) return 1
  const maxDim = Math.max(currentRoll.value.largura, currentRoll.value.comprimento)
  return maxDim > MAX_DISPLAY_DIM ? MAX_DISPLAY_DIM / maxDim : 1
})

const displaySize = computed(() => ({
  width: currentRoll.value ? currentRoll.value.largura * scaleFactor.value : 800,
  height: currentRoll.value ? currentRoll.value.comprimento * scaleFactor.value : 1000
}))

onMounted(async () => {
  await nextTick()
  const plano = window.history.state?.planoCorte

  if (plano && plano.materiais) {
    materiais.value = plano.materiais
    rectangles.value = plano.listaDeCortes.map((c: any) => ({
      ...c,
      roloId: c.roloId || 0,
      color: c.color || '#3b82f6'
    }))
  } else {
    rectangles.value = [
      { x: 100, y: 100, width: 300, height: 400, color: '#3b82f6', op: 1001, roloId: 0 },
      { x: 500, y: 200, width: 250, height: 250, color: '#ef4444', op: 1002, roloId: 0 },
      { x: 50, y: 50, width: 600, height: 300, color: '#10b981', op: 2001, roloId: 1 }
    ]
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

watch(currentRollIndex, () => {
  selectedIndex.value = -1
  initCanvas()
})

function handleScroll() {
  if (!scrollContainer.value) return
  const { scrollTop: top, scrollHeight, clientHeight } = scrollContainer.value
  scrollTop.value = top
  isAtBottom.value = top + clientHeight >= scrollHeight - 5
}

watch(selectedIndex, (newIndex) => {
  if (newIndex !== -1 && rectangles.value[newIndex]) {
    editValues.value = { ...rectangles.value[newIndex] }
  }
})

function draw() {
  if (!canvasRef.value || !currentRoll.value) return
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return
  
  const s = scaleFactor.value
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 1
  for (let i = 0; i < currentRoll.value.comprimento; i += 100) {
    ctx.beginPath(); 
    ctx.moveTo(0, i * s); 
    ctx.lineTo(canvasRef.value.width, i * s); 
    ctx.stroke();
  }

  rectangles.value.forEach((rect, index) => {
    if (rect.roloId !== currentRollIndex.value) return

    const dx = rect.x * s
    const dy = rect.y * s
    const dw = rect.width * s
    const dh = rect.height * s

    ctx.fillStyle = rect.color
    ctx.globalAlpha = 0.8
    ctx.fillRect(dx, dy, dw, dh)
    ctx.globalAlpha = 1.0
    
    const isSelected = selectedIndex.value === index
    ctx.strokeStyle = isSelected ? '#f37021' : '#1f2937'
    ctx.lineWidth = isSelected ? 3 : 1
    ctx.strokeRect(dx, dy, dw, dh)
    
    ctx.fillStyle = isSelected ? '#000' : '#fff'
    ctx.font = `bold ${Math.max(10, 12 * s)}px sans-serif`
    ctx.fillText(`OP ${rect.op}`, dx + 5, dy + (18 * s))
  })
}

function handleMouseDown(e: MouseEvent) {
  if (!canvasRef.value) return
  const canvasRect = canvasRef.value.getBoundingClientRect()
  const s = scaleFactor.value
  const mouseX = (e.clientX - canvasRect.left) / s
  const mouseY = (e.clientY - canvasRect.top) / s
  
  draggingIndex = -1
  for (let i = rectangles.value.length - 1; i >= 0; i--) {
    const r = rectangles.value[i]
    if (r.roloId !== currentRollIndex.value) continue

    if (mouseX >= r.x && mouseX <= r.x + r.width &&
        mouseY >= r.y && mouseY <= r.y + r.height) {
      draggingIndex = i
      selectedIndex.value = i
      offsetX = mouseX - r.x
      offsetY = mouseY - r.y
      break
    }
  }
  draw()
}

function handleMouseMove(e: MouseEvent) {
  if (draggingIndex === -1 || !canvasRef.value || !currentRoll.value) return
  const canvasRect = canvasRef.value.getBoundingClientRect()
  const s = scaleFactor.value
  const mouseX = (e.clientX - canvasRect.left) / s
  const mouseY = (e.clientY - canvasRect.top) / s
  
  let newX = mouseX - offsetX
  let newY = mouseY - offsetY
  
  const draggedRect = rectangles.value[draggingIndex]
  const { largura, comprimento } = currentRoll.value

  if (Math.abs(newX) < snapThreshold) newX = 0
  if (Math.abs(newY) < snapThreshold) newY = 0
  if (Math.abs(newX + draggedRect.width - largura) < snapThreshold) newX = largura - draggedRect.width
  if (Math.abs(newY + draggedRect.height - comprimento) < snapThreshold) newY = comprimento - draggedRect.height
  
  rectangles.value.forEach((other, index) => {
    if (index === draggingIndex || other.roloId !== currentRollIndex.value) return
    if (Math.abs(newX - (other.x + other.width)) < snapThreshold &&
        !(newY + draggedRect.height < other.y || newY > other.y + other.height)) newX = other.x + other.width
    if (Math.abs(newX + draggedRect.width - other.x) < snapThreshold &&
        !(newY + draggedRect.height < other.y || newY > other.y + other.height)) newX = other.x - draggedRect.width
    if (Math.abs(newY - (other.y + other.height)) < snapThreshold &&
        !(newX + draggedRect.width < other.x || newX > other.x + other.width)) newY = other.y + other.height
    if (Math.abs(newY + draggedRect.height - other.y) < snapThreshold &&
        !(newX + draggedRect.width < other.x || newX > other.x + other.width)) newY = other.y - draggedRect.height
  })

  newX = Math.max(0, Math.min(newX, largura - draggedRect.width))
  newY = Math.max(0, Math.min(newY, comprimento - draggedRect.height))

  rectangles.value[draggingIndex].x = newX
  rectangles.value[draggingIndex].y = newY
  
  editValues.value.x = Math.round(newX)
  editValues.value.y = Math.round(newY)
  
  draw()
}

function handleMouseUp() {
  draggingIndex = -1
}

function updateRectangle() {
  if (selectedIndex.value !== -1) {
    const r = rectangles.value[selectedIndex.value]
    r.x = editValues.value.x
    r.y = editValues.value.y
    r.width = editValues.value.width
    r.height = editValues.value.height
    draw()
  }
}

function deleteRectangle() {
  if (selectedIndex.value !== -1) {
    rectangles.value.splice(selectedIndex.value, 1)
    selectedIndex.value = -1
    draw()
  }
}

function deleteRectangleAtIndex(index: number) {
  rectangles.value.splice(index, 1)
  if (selectedIndex.value === index) selectedIndex.value = -1
  draw()
}

function deselectRectangle() {
  selectedIndex.value = -1
  draw()
}

function selectRectangle(index: number) {
  selectedIndex.value = index
  draw()
}

function addRectangle() {
  const newRect: Rectangle = {
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    color: '#3b82f6',
    op: Math.floor(Math.random() * 9000) + 1000,
    roloId: currentRollIndex.value
  }
  rectangles.value.push(newRect)
  selectedIndex.value = rectangles.value.length - 1
  draw()
}
</script>

<style scoped>
.erp-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.erp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: #1a1a1a;
}

.star-icon {
  color: #ffc107;
  font-size: 1.2rem;
}

.status-badge {
  font-size: 0.85rem;
}

.status-label {
  color: #666;
  margin-right: 5px;
}

.status-value.active {
  color: #28a745;
  font-weight: 600;
}

.erp-content {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Tabs */
.tabs-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #dee2e6;
}

.tabs-navigation {
  display: flex;
  gap: 5px;
}

.erp-tab {
  padding: 10px 20px;
  border: none;
  background: transparent;
  font-weight: 600;
  font-size: 0.85rem;
  color: #666;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  text-transform: uppercase;
}

.erp-tab.active {
  color: #f37021;
  border-bottom-color: #f37021;
}

/* Grid Layout */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 350px;
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

.card-body {
  padding: 15px;
}

.card-body.no-padding {
  padding: 0;
}

/* Canvas Area */
.canvas-section {
  min-height: 600px;
}

.canvas-viewport {
  flex: 1;
  overflow: auto;
  background-color: #f0f0f0;
  padding: 40px;
  display: flex;
  justify-content: center;
}

.canvas-container {
  position: relative;
  background: white;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

canvas {
  display: block;
  cursor: crosshair;
}

/* Form & Inputs */
.property-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.op-badge {
  background: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
  font-weight: 700;
  text-align: center;
  border: 1px solid #e0e0e0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #777;
}

.erp-input {
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
}

.erp-input:focus {
  outline: none;
  border-color: #f37021;
}

/* Buttons */
.btn-primary {
  background-color: #001f3f;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-secondary {
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #ced4da;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
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
  padding: 10px;
  border-bottom: 2px solid #dee2e6;
  color: #666;
}

.erp-table td {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.erp-table tr:hover {
  background-color: #fcfcfc;
  cursor: pointer;
}

.erp-table tr.selected {
  background-color: #fff4ed;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.count-badge {
  background: #f37021;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 40px 20px;
  font-size: 0.9rem;
}

/* Wavy Edges */
.wavy-edge {
  position: absolute;
  left: 0;
  width: 100%;
  height: 10px;
  background-image: radial-gradient(circle at 10px -5px, transparent 12px, #f0f0f0 13px);
  background-size: 20px 20px;
  z-index: 10;
}

.wavy-edge.top {
  top: 0;
}

.wavy-edge.bottom {
  bottom: 0;
  transform: rotate(180deg);
}

@media (max-width: 1024px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
  
  .side-panel {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
}
</style>
