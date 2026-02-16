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
            {{ rolo.nome || 'ROLO ' + (index + 1) }} ({{ rolo.largura }}x{{ rolo.comprimento }})
          </button>
        </div>
        <div class="tabs-actions">
          <button class="btn-secondary" @click="draw" style="margin-right: 10px;">REDESENHAR</button>
          <button class="btn-primary" @click="addRectangle">ADICIONAR CORTE</button>
          <button class="btn-success" @click="irParaRealizacao" style="margin-left: 10px;">IR PARA REALIZAÇÃO</button>
        </div>
      </div>

      <div class="main-grid">
        <!-- Área do Canvas (Lado Esquerdo/Central) -->
        <section class="canvas-section card">
          <div class="card-header">
            <h2 class="card-title">Visualização do Rolo</h2>
            <div class="card-tools">
              <span class="scale-badge">Escala: {{ (scaleFactor * 100).toFixed(1) }}%</span>
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
                <div class="op-badge" :class="{ 'fixed-badge': rectangles[selectedIndex]?.fixed }">
                  OP #{{ rectangles[selectedIndex]?.op }}
                  <span v-if="rectangles[selectedIndex]?.fixed"> (FIXO)</span>
                </div>
                
                <div class="form-grid">
                  <div class="form-group full-width">
                    <label>Ordem de Produção (OP)</label>
                    <select v-model="editValues.op" @change="updateRectangle" class="erp-input" :disabled="rectangles[selectedIndex]?.fixed">
                      <option :value="-1">DESCARTE (OP -1)</option>
                      <option :value="0">ROLO FILHO (OP 0)</option>
                      <option v-for="op in opsIniciais" :key="op.id" :value="op.id">OP #{{ op.id }} - {{ op.cliente }}</option>
                      <option value="MANUAL">MANUAL</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>X (mm)</label>
                    <input type="number" v-model.number="editValues.x" @input="updateRectangle" class="erp-input" :disabled="rectangles[selectedIndex]?.fixed" />
                  </div>
                  <div class="form-group">
                    <label>Y (mm)</label>
                    <input type="number" v-model.number="editValues.y" @input="updateRectangle" class="erp-input" :disabled="rectangles[selectedIndex]?.fixed" />
                  </div>
                  <div class="form-group">
                    <label>Largura</label>
                    <input type="number" v-model.number="editValues.width" @input="updateRectangle" class="erp-input" :disabled="rectangles[selectedIndex]?.fixed" />
                  </div>
                  <div class="form-group">
                    <label>Altura</label>
                    <input type="number" v-model.number="editValues.height" @input="updateRectangle" class="erp-input" :disabled="rectangles[selectedIndex]?.fixed" />
                  </div>
                  <div class="form-group full-width">
                    <label>Transferir para Rolo</label>
                    <select v-model.number="editValues.roloId" @change="transferirRolo" class="erp-input" :disabled="rectangles[selectedIndex]?.fixed">
                      <option v-for="(rolo, idx) in materiais" :key="idx" :value="idx">
                        {{ rolo.nome || 'ROLO ' + (idx + 1) }} ({{ rolo.largura }}x{{ rolo.comprimento }})
                      </option>
                    </select>
                  </div>
                </div>
                
                <div class="form-actions" v-if="!rectangles[selectedIndex]?.fixed">
                  <button @click="rotateRectangle" class="btn-secondary" :disabled="!podeRotacionar">ROTACIONAR 🔄</button>
                </div>

                <div class="form-actions" v-if="!rectangles[selectedIndex]?.fixed">
                  <button @click="deleteRectangle" class="btn-danger">EXCLUIR</button>
                  <button @click="deselectRectangle" class="btn-secondary">FECHAR</button>
                </div>
                <div v-else class="fixed-notice">
                  Este corte já existe no rolo e não pode ser alterado.
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
              <div class="table-container">
                <table class="erp-table">
                  <thead>
                    <tr>
                      <th>OP</th>
                      <th>Rolo</th>
                      <th>Dimensões</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="(rect, index) in rectangles" 
                      :key="index"
                      :class="{ 
                        selected: selectedIndex === index, 
                        'is-fixed': rect.fixed,
                        'other-roll': rect.roloId !== currentRollIndex 
                      }"
                      @click="selectRectangle(index)"
                    >
                      <td><strong>{{ rect.op }}</strong></td>
                      <td><span class="roll-mini-tag">{{ materiais[rect.roloId]?.nome || 'R' + (rect.roloId + 1) }}</span></td>
                      <td>{{ rect.width }} x {{ rect.height }}</td>
                      <td>
                        <span v-if="rect.fixed" class="status-tag fixed">Fixo</span>
                        <span v-else class="status-tag new">Novo</span>
                      </td>
                      <td>
                        <button v-if="!rect.fixed" class="icon-btn delete" @click.stop="deleteRectangleAtIndex(index)">🗑️</button>
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
import { useRouter } from 'vue-router'

interface Material {
  id: string | number
  nome?: string
  largura: number
  comprimento: number
  cortesExistentes?: Rectangle[]
}

interface OP {
  id: number
  cliente: string
  cortes: { width: number, height: number, color: string }[]
}

interface Rectangle {
  x: number
  y: number
  width: number
  height: number
  color: string
  op: string | number
  roloId: number
  fixed?: boolean
}

const props = defineProps<{
  materiaisIniciais: Material[]
  opsIniciais: OP[]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const scrollContainer = ref<HTMLElement | null>(null)

const materiais = ref<Material[]>([])
const rectangles = ref<Rectangle[]>([])
const currentRollIndex = ref(0)

const MAX_DISPLAY_DIM = 1000
const snapThreshold = 15

let draggingIndex = -1
let offsetX = 0
let offsetY = 0

const selectedIndex = ref(-1)
const editValues = ref({ x: 0, y: 0, width: 0, height: 0, color: '', roloId: 0, op: '' as any })

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
  console.log('Corte.vue mounted', props.materiaisIniciais, props.opsIniciais)
  await nextTick()
  
  // Fallback se as props vierem vazias (para teste direto da página)
  const mats = (props.materiaisIniciais && props.materiaisIniciais.length > 0) 
    ? props.materiaisIniciais 
    : [
        { 
          id: 'R1', 
          nome: 'Bobina Master 1200', 
          largura: 1200, 
          comprimento: 5000, 
          cortesExistentes: [
            { x: 0, y: 0, width: 1200, height: 200, op: 'FIXO', color: '#94a3b8', fixed: true }
          ] 
        }
      ];
      
  const ops = (props.opsIniciais && props.opsIniciais.length > 0)
    ? props.opsIniciais
    : [
        { 
          id: 2134, 
          cliente: 'Indústria Metal', 
          cortes: [
            { width: 300, height: 400, color: '#3b82f6' },
            { width: 200, height: 200, color: '#3b82f6' }
          ]
        }
      ];

  if (mats && ops) {
    materiais.value = JSON.parse(JSON.stringify(mats))
    
    const initialRects: Rectangle[] = []
    
    // 1. Adicionar cortes fixos dos rolos
    materiais.value.forEach((rolo, rIdx) => {
      if (rolo.cortesExistentes) {
        rolo.cortesExistentes.forEach(c => {
          initialRects.push({
            ...c,
            roloId: rIdx,
            fixed: true
          })
        })
      }
    })
    
    // 2. Adicionar cortes das OPs com alocação inteligente entre rolos
    let currentRoloIdx = 0
    let currentY = 0
    let alocacaoFalhou = false

    ops.forEach(op => {
      op.cortes.forEach(c => {
        let alocado = false
        
        // Tenta alocar no rolo atual ou nos próximos
        for (let rIdx = currentRoloIdx; rIdx < materiais.value.length; rIdx++) {
          const rolo = materiais.value[rIdx]
          
          // Verifica se o corte cabe na largura do rolo
          if (c.width <= rolo.largura && (currentY + c.height) <= rolo.comprimento) {
            initialRects.push({
              x: 0, y: currentY, width: c.width, height: c.height,
              color: c.color, op: op.id, roloId: rIdx, fixed: false
            })
            currentY += c.height + 10
            currentRoloIdx = rIdx
            alocado = true
            break
          } else if (c.height <= rolo.largura && (currentY + c.width) <= rolo.comprimento) {
            // Tenta rotacionado
            initialRects.push({
              x: 0, y: currentY, width: c.height, height: c.width,
              color: c.color, op: op.id, roloId: rIdx, fixed: false
            })
            currentY += c.width + 10
            currentRoloIdx = rIdx
            alocado = true
            break
          } else {
            // Se não coube no rolo atual, tenta o próximo rolo do zero
            currentY = 0
          }
        }
        
        if (!alocado) alocacaoFalhou = true
      })
    })
    
    if (alocacaoFalhou) {
      alert('Atenção: Alguns cortes não puderam ser alocados nos rolos disponíveis por falta de espaço!')
    }
    
    rectangles.value = initialRects
    console.log('Rectangles initialized:', rectangles.value)
  }

  setTimeout(() => {
    initCanvas()
    draw() // Força o desenho inicial
  }, 200)
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

watch([rectangles, materiais, () => props.materiaisIniciais, () => props.opsIniciais], () => {
  if (canvasRef.value) {
    if (canvasRef.value.width === 0) initCanvas()
    draw()
  }
}, { deep: true })

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

  // Grid de fundo
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

    if (rect.fixed) {
      ctx.save()
      ctx.fillStyle = '#e2e8f0'
      ctx.fillRect(dx, dy, dw, dh)
      ctx.beginPath()
      ctx.rect(dx, dy, dw, dh)
      ctx.clip()
      ctx.strokeStyle = '#94a3b8'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let i = -dh; i < dw + dh; i += 10) {
        ctx.moveTo(dx + i, dy)
        ctx.lineTo(dx + i + dh, dy + dh)
      }
      ctx.stroke()
      ctx.restore()
    } else {
      ctx.fillStyle = rect.color
      ctx.globalAlpha = 0.8
      ctx.fillRect(dx, dy, dw, dh)
      ctx.globalAlpha = 1.0
    }
    
    const isSelected = selectedIndex.value === index
    ctx.strokeStyle = isSelected ? '#f37021' : (rect.fixed ? '#94a3b8' : '#1f2937')
    ctx.lineWidth = isSelected ? 3 : 1
    ctx.strokeRect(dx, dy, dw, dh)
    
    ctx.fillStyle = rect.fixed ? '#64748b' : (isSelected ? '#000' : '#fff')
    ctx.font = `bold ${Math.max(10, 12 * s)}px sans-serif`
    ctx.fillText(`OP ${rect.op}${rect.fixed ? ' (FIXO)' : ''}`, dx + 5, dy + (18 * s))
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
      
      selectedIndex.value = i
      if (!r.fixed) {
        draggingIndex = i
        offsetX = mouseX - r.x
        offsetY = mouseY - r.y
      }
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
    if (r.fixed) return
    r.x = editValues.value.x
    r.y = editValues.value.y
    r.width = editValues.value.width
    r.height = editValues.value.height
    r.op = editValues.value.op
    if (r.op === -1) r.color = '#94a3b8'
    else if (r.op === 0) r.color = '#8b5cf6'
    draw()
  }
}

function transferirRolo() {
  if (selectedIndex.value !== -1) {
    const r = rectangles.value[selectedIndex.value]
    if (r.fixed) return
    const novoRoloIdx = editValues.value.roloId
    const novoRolo = materiais.value[novoRoloIdx]
    if (r.width > novoRolo.largura && r.height > novoRolo.largura) {
      alert('Este corte é largo demais para o rolo de destino!')
      editValues.value.roloId = r.roloId
      return
    }
    if (r.width > novoRolo.largura && r.height <= novoRolo.largura) {
      const oldW = r.width
      r.width = r.height
      r.height = oldW
    }
    r.roloId = novoRoloIdx
    r.x = 0
    r.y = 0
    currentRollIndex.value = novoRoloIdx
    draw()
  }
}

const podeRotacionar = computed(() => {
  if (selectedIndex.value === -1) return false
  const r = rectangles.value[selectedIndex.value]
  if (r.fixed) return false
  return r.height <= currentRoll.value.largura && r.width <= currentRoll.value.comprimento
})

function rotateRectangle() {
  if (selectedIndex.value !== -1 && podeRotacionar.value) {
    const r = rectangles.value[selectedIndex.value]
    const oldW = r.width
    const oldH = r.height
    r.width = oldH
    r.height = oldW
    if (r.x + r.width > currentRoll.value.largura) r.x = currentRoll.value.largura - r.width
    editValues.value.width = r.width
    editValues.value.height = r.height
    editValues.value.x = r.x
    draw()
  }
}

function deleteRectangle() {
  if (selectedIndex.value !== -1) {
    if (rectangles.value[selectedIndex.value].fixed) return
    rectangles.value.splice(selectedIndex.value, 1)
    selectedIndex.value = -1
    draw()
  }
}

function deleteRectangleAtIndex(index: number) {
  if (rectangles.value[index].fixed) return
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
  if (rectangles.value[index].roloId !== currentRollIndex.value) {
    currentRollIndex.value = rectangles.value[index].roloId
  }
  draw()
}

function addRectangle() {
  const newRect: Rectangle = {
    x: 0, y: 0, width: 200, height: 200, color: '#3b82f6', op: 'MANUAL', roloId: currentRollIndex.value, fixed: false
  }
  rectangles.value.push(newRect)
  selectedIndex.value = rectangles.value.length - 1
  draw()
}

const router = useRouter()
function irParaRealizacao() {
  const payload = { materiais: materiais.value, cortes: rectangles.value }
  localStorage.setItem('planoExecucao', JSON.stringify(payload))
  router.push('/realizacao')
}
</script>

<style scoped>
.erp-container { width: 100%; min-height: 100vh; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; }
.erp-content { padding: 20px; max-width: 1400px; margin: 0 auto; }
.tabs-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #dee2e6; }
.tabs-navigation { display: flex; gap: 5px; }
.erp-tab { padding: 10px 20px; border: none; background: transparent; font-weight: 600; font-size: 0.85rem; color: #666; cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.2s; text-transform: uppercase; }
.erp-tab.active { color: #f37021; border-bottom-color: #f37021; }
.main-grid { display: grid; grid-template-columns: 1fr 350px; gap: 20px; }
.card { background: white; border-radius: 4px; border: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); display: flex; flex-direction: column; }
.card-header { padding: 12px 15px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 0.9rem; font-weight: 700; margin: 0; text-transform: uppercase; color: #444; }
.card-body { padding: 15px; }
.card-body.no-padding { padding: 0; }
.canvas-section { min-height: 600px; }
.canvas-viewport { flex: 1; overflow: auto; background-color: #f0f0f0; padding: 40px; display: flex; justify-content: center; }
.canvas-container { position: relative; background: white; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
canvas { display: block; cursor: crosshair; background-color: white; border: 1px solid #ccc; }
.property-form { display: flex; flex-direction: column; gap: 15px; }
.op-badge { background: #f8f9fa; padding: 8px; border-radius: 4px; font-weight: 700; text-align: center; border: 1px solid #e0e0e0; }
.op-badge.fixed-badge { background: #e2e8f0; color: #64748b; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group label { font-size: 0.75rem; font-weight: 600; color: #777; }
.erp-input { padding: 8px; border: 1px solid #ced4da; border-radius: 4px; font-size: 0.9rem; }
.erp-input:focus { outline: none; border-color: #f37021; }
.erp-input:disabled { background-color: #f8f9fa; color: #adb5bd; cursor: not-allowed; }
.fixed-notice { font-size: 0.8rem; color: #dc3545; font-style: italic; text-align: center; }
.btn-primary { background-color: #001f3f; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-weight: 700; cursor: pointer; font-size: 0.8rem; }
.btn-secondary { background-color: #f8f9fa; color: #333; border: 1px solid #ced4da; padding: 8px 15px; border-radius: 4px; cursor: pointer; }
.btn-danger { background-color: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; }
.btn-success { background-color: #15803d; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-weight: 700; cursor: pointer; font-size: 0.8rem; }
.form-actions { display: flex; gap: 10px; margin-top: 10px; }
.table-container { max-height: 400px; overflow-y: auto; }
.erp-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.erp-table th { background: #f8f9fa; text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6; color: #666; position: sticky; top: 0; z-index: 1; }
.erp-table td { padding: 10px; border-bottom: 1px solid #eee; }
.erp-table tr:hover { background-color: #fcfcfc; cursor: pointer; }
.erp-table tr.selected { background-color: #fff4ed; }
.erp-table tr.is-fixed { color: #94a3b8; }
.icon-btn { background: none; border: none; cursor: pointer; font-size: 1rem; }
.status-tag { font-size: 0.7rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; }
.status-tag.fixed { background: #e2e8f0; color: #64748b; }
.status-tag.new { background: #dcfce7; color: #15803d; }
.count-badge { background: #f37021; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: 700; }
.empty-state { text-align: center; color: #999; padding: 40px 20px; font-size: 0.9rem; }
.wavy-edge { position: absolute; left: 0; width: 100%; height: 10px; background-image: radial-gradient(circle at 10px -5px, transparent 12px, #f0f0f0 13px); background-size: 20px 20px; z-index: 10; }
.wavy-edge.top { top: 0; }
.wavy-edge.bottom { bottom: 0; transform: rotate(180deg); }
.full-width { grid-column: span 2; }
.scale-badge { background: #e2e8f0; color: #475569; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600; margin-right: 10px; }
.roll-mini-tag { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 1px 4px; border-radius: 3px; font-size: 0.7rem; color: #64748b; }
.erp-table tr.other-roll { opacity: 0.6; }
.erp-table tr.other-roll:hover { opacity: 1; }
@media (max-width: 1024px) { .main-grid { grid-template-columns: 1fr; } .side-panel { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; } }
</style>
  