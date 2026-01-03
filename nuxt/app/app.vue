<template>
  <div class="app-wrapper">
    <div class="app-container">
      <h1>Canvas com Retângulos Arrastáveis</h1>
      <div class="controls">
        <button @click="addRectangle">Adicionar Retângulo</button>
      </div>
      <canvas
        ref="canvasRef"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
      ></canvas>
    </div>

    <!-- Painel Lateral -->
    <div class="side-panel">
      <h2>Propriedades do Retângulo</h2>
      
      <div v-if="selectedIndex !== -1" class="properties">
        <div class="property-group">
          <label>Retângulo Selecionado:</label>
          <div class="selected-indicator">
            <span class="color-box" :style="{ backgroundColor: rectangles[selectedIndex]?.color }"></span>
            <span>Retângulo #{{ selectedIndex + 1 }}</span>
          </div>
        </div>

        <div class="property-group">
          <label for="pos-x">Posição X:</label>
          <input
            id="pos-x"
            type="number"
            v-model.number="editValues.x"
            @input="updateRectangle"
            min="0"
            :max="canvasWidth - editValues.width"
          />
        </div>

        <div class="property-group">
          <label for="pos-y">Posição Y:</label>
          <input
            id="pos-y"
            type="number"
            v-model.number="editValues.y"
            @input="updateRectangle"
            min="0"
            :max="canvasHeight - editValues.height"
          />
        </div>

        <div class="property-group">
          <label for="width">Largura:</label>
          <input
            id="width"
            type="number"
            v-model.number="editValues.width"
            @input="updateRectangle"
            min="10"
            :max="canvasWidth - editValues.x"
          />
        </div>

        <div class="property-group">
          <label for="height">Altura:</label>
          <input
            id="height"
            type="number"
            v-model.number="editValues.height"
            @input="updateRectangle"
            min="10"
            :max="canvasHeight - editValues.y"
          />
        </div>

        <div class="property-group">
          <label for="color">Cor:</label>
          <div class="color-input-group">
            <input
              id="color"
              type="color"
              v-model="editValues.color"
              @input="updateRectangle"
            />
            <input
              type="text"
              v-model="editValues.color"
              @input="updateRectangle"
              placeholder="#000000"
              class="color-text"
            />
          </div>
        </div>

        <div class="action-buttons">
          <button @click="deleteRectangle" class="delete-btn">Excluir Retângulo</button>
          <button @click="deselectRectangle" class="deselect-btn">Desselecionar</button>
        </div>
      </div>

      <div v-else class="no-selection">
        <p>Nenhum retângulo selecionado</p>
        <p class="hint">Clique em um retângulo no canvas para editar suas propriedades</p>
      </div>

      <!-- Lista de todos os retângulos -->
      <div class="rectangles-list">
        <h3>Todos os Retângulos ({{ rectangles.length }})</h3>
        <div class="list-items">
          <div
            v-for="(rect, index) in rectangles"
            :key="index"
            class="list-item"
            :class="{ active: selectedIndex === index }"
            @click="selectRectangle(index)"
          >
            <span class="color-box" :style="{ backgroundColor: rect.color }"></span>
            <span class="item-info">
              Retângulo #{{ index + 1 }}
              <small>({{ Math.round(rect.x) }}, {{ Math.round(rect.y) }})</small>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'

interface Rectangle {
  x: number
  y: number
  width: number
  height: number
  color: string
  op: number
}

const canvasRef = ref<HTMLCanvasElement | null>(null)

const rectangles = ref<Rectangle[]>([
  { x: 50, y: 50, width: 100, height: 80, color: '#3b82f6', op: 2134 },
  { x: 200, y: 150, width: 120, height: 90, color: '#ef4444' , op: 543},
  { x: 400, y: 100, width: 80, height: 100, color: '#10b981', op: 2033 },
])

const canvasWidth = 800
const canvasHeight = 600
const snapThreshold = 10

let draggingIndex = -1
let offsetX = 0
let offsetY = 0

// Estado para o painel lateral
const selectedIndex = ref(-1)
const editValues = ref({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  color: '#000000',
  op: 0
})

onMounted(async () => {
  await nextTick()
  if (canvasRef.value) {
    canvasRef.value.width = canvasWidth
    canvasRef.value.height = canvasHeight
    draw()
  }
})

// Observar mudanças no índice selecionado
watch(selectedIndex, (newIndex) => {
  if (newIndex !== -1 && rectangles.value[newIndex]) {
    editValues.value = { ...rectangles.value[newIndex] }
  }
})

function draw() {
  if (!canvasRef.value) return
  
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return
  
  // Limpar canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  
  // Desenhar borda do canvas
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 2
  ctx.strokeRect(0, 0, canvasWidth, canvasHeight)
  
  // Desenhar retângulos
  rectangles.value.forEach((rect, index) => {
    ctx.fillStyle = rect.color
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
    
    // Desenhar borda do retângulo
    const isSelected = selectedIndex.value === index
    const isDragging = draggingIndex === index
    
    if (isSelected || isDragging) {
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 3
    } else {
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 1
    }
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
    
    // Desenhar número do retângulo
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 14px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`OP #${rect.op}`, rect.x + rect.width / 2, rect.y + rect.height / 2)
  })
}

function handleMouseDown(e: MouseEvent) {
  if (!canvasRef.value) return
  
  const rect = canvasRef.value.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top
  
  // Verificar se clicou em algum retângulo (do último para o primeiro)
  for (let i = rectangles.value.length - 1; i >= 0; i--) {
    const r = rectangles.value[i]
    if (
      r &&
      mouseX >= r.x &&
      mouseX <= r.x + r.width &&
      mouseY >= r.y &&
      mouseY <= r.y + r.height
    ) {
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
  if (draggingIndex === -1 || !canvasRef.value) return
  
  const rect = canvasRef.value.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top
  
  let newX = mouseX - offsetX
  let newY = mouseY - offsetY
  
  const draggedRect = rectangles.value[draggingIndex]
  
  // Aplicar snap nas paredes do canvas
  if (Math.abs(newX) < snapThreshold) {
    newX = 0
  }
  if (Math.abs(newY) < snapThreshold) {
    newY = 0
  }
  if (draggedRect && Math.abs(newX + draggedRect.width - canvasWidth) < snapThreshold) {
    newX = canvasWidth - draggedRect.width
  }
  if (draggedRect && Math.abs(newY + draggedRect.height - canvasHeight) < snapThreshold) {
    newY = canvasHeight - draggedRect.height
  }
  
  // Aplicar snap em outros retângulos que estão grudados nas paredes
  rectangles.value.forEach((otherRect, index) => {
    if (index === draggingIndex) return
    
    // Verificar se o outro retângulo está grudado em alguma parede
    const isOtherSnappedToWall = 
      otherRect.x === 0 || 
      otherRect.y === 0 || 
      otherRect.x + otherRect.width === canvasWidth || 
      otherRect.y + otherRect.height === canvasHeight
    
    if (!isOtherSnappedToWall) return
    
    // Snap horizontal (esquerda do arrastado com direita do outro)
    if (
      draggedRect && 
      Math.abs(newX - (otherRect.x + otherRect.width)) < snapThreshold &&
      !(newY + draggedRect.height < otherRect.y || newY > otherRect.y + otherRect.height)
    ) {
      newX = otherRect.x + otherRect.width
    }
    
    // Snap horizontal (direita do arrastado com esquerda do outro)
    if (
      draggedRect && 
      Math.abs(newX + draggedRect.width - otherRect.x) < snapThreshold &&
      !(newY + draggedRect.height < otherRect.y || newY > otherRect.y + otherRect.height)
    ) {
      newX = otherRect.x - draggedRect.width
    }
    
    // Snap vertical (topo do arrastado com fundo do outro)
    if (
      draggedRect && 
      Math.abs(newY - (otherRect.y + otherRect.height)) < snapThreshold &&
      !(newX + draggedRect.width < otherRect.x || newX > otherRect.x + otherRect.width)
    ) {
      newY = otherRect.y + otherRect.height
    }
    
    // Snap vertical (fundo do arrastado com topo do outro)
    if (
      draggedRect && 
      Math.abs(newY + draggedRect.height - otherRect.y) < snapThreshold &&
      !(newX + draggedRect.width < otherRect.x || newX > otherRect.x + otherRect.width)
    ) {
      newY = otherRect.y - draggedRect.height
    }
  })
  
  // Limitar aos limites do canvas
  if (draggedRect) 
  {
    newX = Math.max(0, Math.min(newX, canvasWidth - draggedRect.width))
    newY = Math.max(0, Math.min(newY, canvasHeight - draggedRect.height))
  }
  
  rectangles.value[draggingIndex].x = newX
  rectangles.value[draggingIndex].y = newY
  
  // Atualizar valores de edição
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
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
  const randomColor = colors[Math.floor(Math.random() * colors.length)] || '#000000'
  
  rectangles.value.push({
    x: Math.random() * (canvasWidth - 100),
    y: Math.random() * (canvasHeight - 100),
    width: 80 + Math.random() * 60,
    height: 80 + Math.random() * 60,
    color: randomColor,
    op: Math.floor(Math.random() * 5000)
  })
  
  draw()
}

function updateRectangle() {
  // Melhore a guarda para verificar se o índice é válido E se o objeto existe
  if (selectedIndex.value === -1 || !rectangles.value[selectedIndex.value]) return
  
  // Validar e limitar valores (usando variáveis locais para garantir tipagem)
  const current = editValues.value
  
  const validatedX = Math.max(0, Math.min(current.x, canvasWidth - current.width))
  const validatedY = Math.max(0, Math.min(current.y, canvasHeight - current.height))
  const validatedW = Math.max(10, Math.min(current.width, canvasWidth - validatedX))
  const validatedH = Math.max(10, Math.min(current.height, canvasHeight - validatedY))
  
  // Atualizar de forma explícita para evitar erro de "string | undefined"
  rectangles.value[selectedIndex.value] = {
    x: validatedX,
    y: validatedY,
    width: validatedW,
    height: validatedH,
    color: current.color, // Aqui o TS agora tem certeza que é string
    op: current.op
  }
  
  draw()
}

function selectRectangle(index: number) {
  selectedIndex.value = index
  draw()
}

function deselectRectangle() {
  selectedIndex.value = -1
  draw()
}

function deleteRectangle() {
  if (selectedIndex.value === -1) return
  rectangles.value.splice(selectedIndex.value, 1)
  selectedIndex.value = -1
  draw()
}
</script>

<style scoped src="~/assets/styles/app.css">
</style>
