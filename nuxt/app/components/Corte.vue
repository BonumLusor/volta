<template>
  <div class="app-container">
    <header class="header-controls">
      <div class="tabs-container">
        <button 
          v-for="(rolo, index) in materiais" 
          :key="index"
          class="tab-button"
          :class="{ active: currentRollIndex === index }"
          @click="currentRollIndex = index"
        >
          Rolo {{ index + 1 }} 
          <span class="tab-dim">({{ rolo.largura }}x{{ rolo.comprimento }})</span>
        </button>
      </div>
      <div class="actions">
        <button class="add-btn" @click="addRectangle">Adicionar Corte</button>
      </div>
    </header>
    
    <main class="main-layout">
      <div 
        class="canvas-area"
        ref="scrollContainer"
        @scroll="handleScroll"
      >
        <div 
          class="canvas-wrapper"
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

      <!-- Painel Lateral -->
      <aside class="side-panel">
        <div class="panel-section">
          <h2>Propriedades</h2>
          
          <div v-if="selectedIndex !== -1" class="properties">
            <div class="property-info">
              <strong>OP #{{ rectangles[selectedIndex]?.op }}</strong>
              <span>Rolo: {{ rectangles[selectedIndex]?.roloId + 1 }}</span>
            </div>

            <div class="property-grid">
              <div class="field">
                <label>X (mm)</label>
                <input type="number" v-model.number="editValues.x" @input="updateRectangle" />
              </div>
              <div class="field">
                <label>Y (mm)</label>
                <input type="number" v-model.number="editValues.y" @input="updateRectangle" />
              </div>
              <div class="field">
                <label>Largura</label>
                <input type="number" v-model.number="editValues.width" @input="updateRectangle" />
              </div>
              <div class="field">
                <label>Altura</label>
                <input type="number" v-model.number="editValues.height" @input="updateRectangle" />
              </div>
            </div>

            <div class="action-buttons">
              <button @click="deleteRectangle" class="delete-btn">Excluir</button>
              <button @click="deselectRectangle" class="deselect-btn">Fechar</button>
            </div>
          </div>

          <div v-else class="no-selection">
            <p>Selecione um corte para editar</p>
          </div>
        </div>

        <div class="panel-section list-section">
          <h3>Cortes neste Rolo</h3>
          <div class="list-items">
            <div
              v-for="(rect, index) in rectangles"
              :key="index"
              v-show="rect.roloId === currentRollIndex"
              class="list-item"
              :class="{ active: selectedIndex === index }"
              @click="selectRectangle(index)"
            >
              <div class="item-header">
                <span>OP {{ rect.op }}</span>
                <span class="item-size">{{ rect.width }}x{{ rect.height }}</span>
              </div>
              <small>Pos: {{ rect.x.toFixed(0) }}, {{ rect.y.toFixed(0) }}</small>
            </div>
          </div>
        </div>
      </aside>
    </main>
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
const snapThreshold = 15 // Snap em unidades reais

let draggingIndex = -1
let offsetX = 0
let offsetY = 0

const selectedIndex = ref(-1)
const editValues = ref({ x: 0, y: 0, width: 0, height: 0, color: '', roloId: 0 })

const scrollTop = ref(0)
const isAtBottom = ref(false)

// Cálculo de Escala
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

  // Grid escalado
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

    // Coordenadas exibidas (escaladas)
    const dx = rect.x * s
    const dy = rect.y * s
    const dw = rect.width * s
    const dh = rect.height * s

    ctx.fillStyle = rect.color
    ctx.globalAlpha = 0.8
    ctx.fillRect(dx, dy, dw, dh)
    ctx.globalAlpha = 1.0
    
    const isSelected = selectedIndex.value === index
    ctx.strokeStyle = isSelected ? '#fbbf24' : '#1f2937'
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
  // Converte mouse para unidades REAIS
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

  // Snap paredes (em unidades reais)
  if (Math.abs(newX) < snapThreshold) newX = 0
  if (Math.abs(newY) < snapThreshold) newY = 0
  if (Math.abs(newX + draggedRect.width - largura) < snapThreshold) newX = largura - draggedRect.width
  if (Math.abs(newY + draggedRect.height - comprimento) < snapThreshold) newY = comprimento - draggedRect.height
  
  // Snap outros objetos
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
  
  if (selectedIndex.value === draggingIndex) {
    editValues.value.x = newX
    editValues.value.y = newY
  }
  
  draw()
}

function handleMouseUp() {
  draggingIndex = -1
  draw()
}

function addRectangle() {
  if (!currentRoll.value) return
  rectangles.value.push({
    x: 0, y: 0, width: 200, height: 200,
    color: '#6366f1',
    op: Math.floor(Math.random() * 9000) + 1000,
    roloId: currentRollIndex.value
  })
  selectedIndex.value = rectangles.value.length - 1
  draw()
}

function updateRectangle() {
  if (selectedIndex.value === -1 || !currentRoll.value) return
  const { largura, comprimento } = currentRoll.value

  editValues.value.x = Math.max(0, Math.min(editValues.value.x, largura - editValues.value.width))
  editValues.value.y = Math.max(0, Math.min(editValues.value.y, comprimento - editValues.value.height))
  
  rectangles.value[selectedIndex.value] = { ...editValues.value }
  draw()
}

function selectRectangle(index: number) {
  selectedIndex.value = index
  currentRollIndex.value = rectangles.value[index].roloId
}

function deselectRectangle() {
  selectedIndex.value = -1
}

function deleteRectangle() {
  if (selectedIndex.value === -1) return
  rectangles.value.splice(selectedIndex.value, 1)
  selectedIndex.value = -1
  draw()
}
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden; /* Remove scroll da página */
  background-color: #f9fafb;
  color: #111827;
  font-family: system-ui, -apple-system, sans-serif;
}

.header-controls {
  background: #ffffff;
  padding: 0 20px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.tabs-container {
  display: flex;
  gap: 4px;
  height: 100%;
  align-items: flex-end;
}

.tab-button {
  padding: 10px 20px;
  border: 1px solid transparent;
  border-bottom: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.2s;
}

.tab-button:hover {
  background: #f3f4f6;
  color: #111827;
}

.tab-button.active {
  background: #fff;
  border-color: #e5e7eb;
  color: #2563eb;
  position: relative;
  z-index: 2;
  margin-bottom: -1px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}

.tab-dim {
  font-size: 10px;
  opacity: 0.7;
}

.add-btn {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.main-layout {
  display: flex;
  flex: 1;
  overflow: hidden; /* Garante que apenas áreas internas rolem */
}

.canvas-area {
  flex: 1;
  overflow: auto;
  padding: 40px;
  display: flex;
  justify-content: center;
  background-color: #f3f4f6;
  position: relative;
}

.canvas-wrapper {
  position: relative;
  background-color: white;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

canvas {
  display: block;
  border-left: 1px solid #000;
  border-right: 1px solid #000;
}

.wavy-edge {
  position: sticky;
  left: 0;
  width: 100%;
  height: 30px;
  z-index: 5;
  background: repeating-linear-gradient(45deg, #000, #000 1px, #fff 1px, #fff 8px);
  --mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 50' preserveAspectRatio='none'%3E%3Cpath d='M0,50 L0,20 Q200,0 400,20 T800,20 L800,50 Z' /%3E%3C/svg%3E");
  -webkit-mask-image: var(--mask);
  mask-image: var(--mask);
  -webkit-mask-size: 100% 100%;
}

.wavy-edge.top { top: 0; transform: rotate(180deg); }
.wavy-edge.bottom { bottom: 0; }

.side-panel {
  width: 320px;
  background: white;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.panel-section {
  padding: 20px;
  border-bottom: 1px solid #f3f4f6;
}

.list-section {
  flex: 1;
  overflow-y: auto;
}

h2 { font-size: 16px; margin: 0 0 15px 0; color: #374151; }
h3 { font-size: 14px; margin-bottom: 12px; color: #6b7280; }

.property-info { margin-bottom: 15px; display: flex; flex-direction: column; }
.property-info span { font-size: 12px; color: #6b7280; }

.property-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field { display: flex; flex-direction: column; gap: 4px; }
.field label { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; }
.field input {
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 13px;
}

.action-buttons {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.delete-btn { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }
.deselect-btn { background: #f3f4f6; color: #4b5563; border: 1px solid #e5e7eb; }

.list-items { display: flex; flex-direction: column; gap: 8px; }
.list-item {
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.list-item:hover { border-color: #2563eb; }
.list-item.active { background: #eff6ff; border-color: #2563eb; border-width: 2px; }

.item-header { display: flex; justify-content: space-between; align-items: center; }
.item-size { font-size: 11px; background: #e5e7eb; padding: 2px 6px; border-radius: 4px; }
.list-item small { color: #9ca3af; font-size: 11px; }

.no-selection {
  text-align: center;
  padding: 40px 0;
  color: #9ca3af;
  font-style: italic;
  font-size: 14px;
}
</style>