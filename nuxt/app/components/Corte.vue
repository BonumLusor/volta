    <template>
      <div class="erp-container">
        <div class="erp-content">
          <!-- Seção de Abas de Rolos -->
          <div class="tabs-section">
            <div class="tabs-navigation">
              <button v-for="(rolo, index) in materiais" :key="index" class="erp-tab"
                :class="{ active: currentRollIndex === index }" @click="currentRollIndex = index">
                {{ rolo.nome || 'ROLO ' + (index + 1) }} ({{ rolo.largura }}x{{ rolo.comprimento }})
              </button>
            </div>
            <div class="tabs-actions">
              <button class="btn-secondary" @click="draw" style="margin-right: 10px;">REDESENHAR</button>
              <button class="btn-primary" @click="addRectangle">ADICIONAR CORTE</button>
              <!-- <button class="btn-success" @click="irParaRealizacao" style="margin-left: 10px;">IR PARA REALIZAÇÃO</button> -->
            </div>
          </div>

          <div class="main-grid">
            <!-- Área do Canvas (Lado Esquerdo/Central) -->
            <section class="canvas-section card">
              <div class="card-header">
                <h2 class="card-title">Visualização do Rolo</h2>
                <div class="card-tools">
                  <span class="scale-badge">Escala: {{ (cssScale * 100).toFixed(1) }}%</span>
                  <span class="icon-tool">✏️</span>
                  <span class="icon-tool">📎</span>
                </div>
              </div>

              <div class="canvas-viewport" ref="scrollContainer" @scroll="handleScroll">
                <div class="canvas-container" :style="{
                  width: displaySize.width + 'px',
                  height: displaySize.height + 'px'
                }">
                  <div v-if="scrollTop > 5" class="wavy-edge top"></div>
                  <canvas ref="canvasRef" @mousedown="handleMouseDown" @mousemove="handleMouseMove"
                    @mouseup="handleMouseUp" @mouseleave="handleMouseUp"></canvas>
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
                        <select v-model="editValues.op" @change="updateRectangle" class="erp-input"
                          :disabled="rectangles[selectedIndex]?.fixed">
                          <option :value="-1">DESCARTE (OP -1)</option>
                          <option :value="0">ROLO FILHO (OP 0)</option>
                          <option v-for="op in opsIniciais" :key="op.id" :value="op.id">OP #{{ op.id }} - {{ op.cliente
                            }}</option>
                          <option value="MANUAL">MANUAL</option>
                        </select>
                      </div>
                      <div class="form-group">
                        <label>X (mm)</label>
                        <input type="number" v-model.number="editValues.x" @input="updateRectangle" class="erp-input"
                          :disabled="rectangles[selectedIndex]?.fixed" />
                      </div>
                      <div class="form-group">
                        <label>Y (mm)</label>
                        <input type="number" v-model.number="editValues.y" @input="updateRectangle" class="erp-input"
                          :disabled="rectangles[selectedIndex]?.fixed" />
                      </div>
                      <div class="form-group">
                        <label>Largura</label>
                        <input type="number" v-model.number="editValues.width" @input="updateRectangle"
                          class="erp-input" :disabled="rectangles[selectedIndex]?.fixed" />
                      </div>
                      <div class="form-group">
                        <label>Altura</label>
                        <input type="number" v-model.number="editValues.height" @input="updateRectangle"
                          class="erp-input" :disabled="rectangles[selectedIndex]?.fixed" />
                      </div>
                      <div class="form-group full-width">
                        <label>Transferir para Rolo</label>
                        <select v-model.number="editValues.roloId" @change="transferirRolo" class="erp-input"
                          :disabled="rectangles[selectedIndex]?.fixed">
                          <option v-for="(rolo, idx) in materiais" :key="idx" :value="idx">
                            {{ rolo.nome || 'ROLO ' + (idx + 1) }} ({{ rolo.largura }}x{{ rolo.comprimento }})
                          </option>
                        </select>
                      </div>
                    </div>

                    <div class="form-actions" v-if="!rectangles[selectedIndex]?.fixed">
                      <button @click="rotateRectangle" class="btn-secondary" :disabled="!podeRotacionar">ROTACIONAR
                        🔄</button>
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
                  <span class="count-badge">{{rectangles.filter(r => r.roloId === currentRollIndex).length}}</span>
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
                        <tr v-for="(rect, index) in rectangles" :key="index" :class="{
                          selected: selectedIndex === index,
                          'is-fixed': rect.fixed,
                          'other-roll': rect.roloId !== currentRollIndex
                        }" @click="selectRectangle(index)">
                          <td><strong>{{ rect.op }}</strong></td>
                          <td><span class="roll-mini-tag">{{ materiais[rect.roloId]?.nome || 'R' + (rect.roloId + 1)
                              }}</span></td>
                          <td>{{ rect.width }} x {{ rect.height }}</td>
                          <td>
                            <span v-if="rect.fixed" class="status-tag fixed">Fixo</span>
                            <span v-else class="status-tag new">Novo</span>
                          </td>
                          <td>
                            <button v-if="!rect.fixed" class="icon-btn delete"
                              @click.stop="deleteRectangleAtIndex(index)">🗑️</button>
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
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import { useRouter } from 'vue-router'

const obterDadosParaBanco = () => {
  console.log("Gerando payload para o banco...");
  return {
    pecas: rectangles.value
      .filter(r => !r.fixed) // Ignora o que já estava lá
      .map((r, index) => {
        const materialRelacionado = materiais.value[r.roloId];
        return {
          cod_rolo: materialRelacionado?.id || 0,
          cod_op: (r.op === 'MANUAL' || r.op === 'LANÇAMENTO MANUAL') ? 0 : r.op,
          cod_op_pc: index + 1,
          largura: Math.round(r.width),
          comprimento: Math.round(r.height),
          m2: parseFloat(((r.width * r.height) / 1000000).toFixed(6)),
          x0: Math.round(r.x),
          x1: Math.round(r.x + r.width),
          y0: Math.round(r.y),
          y1: Math.round(r.y + r.height),
          nr_serie: r.op === 0 ? 'CORTE' : (r.op === -1 ? 'SUCATA' : 'PECA')
        };
      })
  };
};

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

defineExpose({
  getPlanoProcessado: () => {
    const contadoresPorOP = {}; // Para gerar o cod_embalagem da PEÇA nova

    return {
      pecas: rectangles.value
        .filter(r => !r.fixed)
        .map((r) => {
          // 1. Localiza a matéria-prima (rolo/chapa) usada para este corte
          const materialOrigem = materiais.value[r.roloId];
          
          // 2. Controla o sequencial de embalagem para a peça final (Destino)
          if (!contadoresPorOP[r.op]) contadoresPorOP[r.op] = 0;
          contadoresPorOP[r.op]++;

          return {
            // DADOS DA MATÉRIA PRIMA (ORIGEM)
            cod_rolo: materialOrigem.cod_rolo || materialOrigem.id, // ID único do saldo
            cod_lote_origem: materialOrigem.cod_lote,
            cod_embalagem_origem: materialOrigem.cod_embalagem, // <--- VALOR DO eq_saldo (ex: 2)

            // DADOS DA PEÇA SENDO GERADA (DESTINO)
            cod_op: (r.op === 'MANUAL') ? 0 : r.op,
            cod_lote: r.op, // O lote da peça nova é o número da OP
            cod_embalagem: contadoresPorOP[r.op], // Sequencial da peça (1, 2, 3...)
            
            // MEDIDAS E COORDENADAS
            largura: Math.round(r.width),
            comprimento: Math.round(r.height),
            m2: parseFloat(((r.width * r.height) / 1000000).toFixed(6)),
            x0: Math.round(r.x),
            x1: Math.round(r.x + r.width),
            y0: Math.round(r.y),
            y1: Math.round(r.y + r.height),
            nr_serie: r.op === 0 ? 'CORTE' : (r.op === -1 ? 'SUCATA' : 'PECA')
          }
        })
    }
  }
})


const canvasRef = ref<HTMLCanvasElement | null>(null)
const scrollContainer = ref<HTMLElement | null>(null)

const materiais = ref<Material[]>([])
const rectangles = ref<Rectangle[]>([])
const currentRollIndex = ref(0)

const snapThreshold = 15

// Limite seguro máximo atualizado para navegadores modernos (Evita Error State preservando maior nitidez possível)
const MAX_CANVAS_DIMENSION = 32000

let draggingIndex = -1
let offsetX = 0
let offsetY = 0

const selectedIndex = ref(-1)
const editValues = ref({ x: 0, y: 0, width: 0, height: 0, color: '', roloId: 0, op: '' as any })

const scrollTop = ref(0)
const isAtBottom = ref(false)

// Estado dinâmico da largura do container
const containerWidth = ref(0)
let resizeObserver: ResizeObserver | null = null

const currentRoll = computed(() => materiais.value[currentRollIndex.value])

// Escala Visual (CSS): Determina o tamanho DOM da chapa preenchendo 100%
const cssScale = computed(() => {
  if (!currentRoll.value || !containerWidth.value) return 1
  const largura = Number(currentRoll.value.largura)
  if (!largura || isNaN(largura) || largura <= 0) return 1

  const scale = containerWidth.value / largura
  return isNaN(scale) || scale <= 0 ? 1 : scale
})

// Tamanho Visual (DOM/CSS)
const displaySize = computed(() => {
  let w = 800
  let h = 1000

  if (currentRoll.value) {
    w = Number(currentRoll.value.largura) * cssScale.value
    h = Number(currentRoll.value.comprimento) * cssScale.value
  } else if (containerWidth.value) {
    w = containerWidth.value
  }

  return {
    width: isNaN(w) || w < 1 ? 1 : Math.round(w),
    height: isNaN(h) || h < 1 ? 1 : Math.round(h)
  }
})

// Tamanho Físico e Seguro (Aplicações Internas de High-DPI no Canvas)
const physicalSize = computed(() => {
  if (!currentRoll.value) return { width: displaySize.value.width, height: displaySize.value.height, renderScale: cssScale.value };

  // Obtém o Pixel Ratio (1 para monitores comuns, 2+ para Telas Retina/HD/MacBooks)
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  let w = displaySize.value.width * dpr;
  let h = displaySize.value.height * dpr;

  // Se exceder o limite pesado do navegador (ex: Rolos de 52 metros), redimensiona preservando o Aspect Ratio
  if (h > MAX_CANVAS_DIMENSION) {
    const ratio = MAX_CANVAS_DIMENSION / h;
    h = MAX_CANVAS_DIMENSION;
    w = w * ratio;
  }
  if (w > MAX_CANVAS_DIMENSION) {
    const ratio = MAX_CANVAS_DIMENSION / w;
    w = MAX_CANVAS_DIMENSION;
    h = h * ratio;
  }

  // Escala final interna: mapeia diretamente os milímetros do material (mm) para os pixels físicos da tela
  const rScale = w / Number(currentRoll.value.largura);

  return {
    width: Math.max(1, Math.floor(w)),
    height: Math.max(1, Math.floor(h)),
    renderScale: isNaN(rScale) || rScale <= 0 ? 1 : rScale
  }
})

onMounted(async () => {
  console.log('Corte.vue mounted', props.materiaisIniciais, props.opsIniciais)
  await nextTick()

  // Observar o tamanho do container para redesenhar na proporção exata de 100% da largura
  if (scrollContainer.value) {
    resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0) {
          containerWidth.value = entry.contentRect.width
        }
      }
    })
    resizeObserver.observe(scrollContainer.value)
  }

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

          if (!rolo) continue

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

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect()
})

function initCanvas() {
  if (canvasRef.value && currentRoll.value) {
    // Definimos a resolução física extrema (Para Retina Displays)
    canvasRef.value.width = physicalSize.value.width
    canvasRef.value.height = physicalSize.value.height
    // Mas impomos ao CSS a exibição na proporção da tela
    canvasRef.value.style.width = displaySize.value.width + 'px'
    canvasRef.value.style.height = displaySize.value.height + 'px'
    draw()
  }
}

watch(displaySize, () => {
  initCanvas()
})

watch(currentRollIndex, () => {
  selectedIndex.value = -1
  initCanvas()
})

watch([rectangles, materiais, () => props.materiaisIniciais, () => props.opsIniciais], () => {
  if (canvasRef.value) {
    if (!canvasRef.value.width || canvasRef.value.width < 1) initCanvas()
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

  const w = canvasRef.value.width
  const h = canvasRef.value.height

  if (!w || !h || !Number.isFinite(w) || !Number.isFinite(h) || w < 1 || h < 1) return

  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  // Usar a proporção da Renderização Física e de Alta Definição
  let s = Number(physicalSize.value.renderScale)
  if (!Number.isFinite(s) || s <= 0) s = 1

  try {
    ctx.clearRect(0, 0, w, h)

    // Grid de fundo
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    for (let i = 0; i < currentRoll.value.comprimento; i += 100) {
      const yPos = i * s;
      if (!Number.isFinite(yPos)) continue;

      ctx.beginPath();
      ctx.moveTo(0, yPos);
      ctx.lineTo(w, yPos);
      ctx.stroke();
    }

    rectangles.value.forEach((rect, index) => {
      if (!rect || rect.roloId !== currentRollIndex.value) return

      const rX = Number(rect.x) || 0
      const rY = Number(rect.y) || 0
      const rW = Number(rect.width) || 0
      const rH = Number(rect.height) || 0

      const dx = rX * s
      const dy = rY * s
      const dw = rW * s
      const dh = rH * s

      if (!Number.isFinite(dx) || !Number.isFinite(dy) || !Number.isFinite(dw) || !Number.isFinite(dh)) return

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
          if (!Number.isFinite(i)) continue;
          ctx.moveTo(dx + i, dy)
          ctx.lineTo(dx + i + dh, dy + dh)
        }
        ctx.stroke()
        ctx.restore()
      } else {
        ctx.fillStyle = rect.color || '#3b82f6'
        ctx.globalAlpha = 0.8
        ctx.fillRect(dx, dy, dw, dh)
        ctx.globalAlpha = 1.0
      }

      const isSelected = selectedIndex.value === index
      ctx.strokeStyle = isSelected ? '#f37021' : (rect.fixed ? '#94a3b8' : '#1f2937')
      ctx.lineWidth = isSelected ? 3 : 1
      ctx.strokeRect(dx, dy, dw, dh)

      ctx.fillStyle = rect.fixed ? '#64748b' : (isSelected ? '#000' : '#fff')

      let fontSize = 14 * s
      if (!Number.isFinite(fontSize) || fontSize <= 0) fontSize = 14

      ctx.font = `bold ${Math.max(2, fontSize)}px sans-serif`

      const textY = dy + (18 * s)
      if (Number.isFinite(dx) && Number.isFinite(textY)) {
        ctx.fillText(`OP ${rect.op}${rect.fixed ? ' (FIXO)' : ''}`, dx + (5 * s), textY)
      }
    })
  } catch (error) {
    console.warn("Corte.vue: Rendering interrompido temporariamente para prevenir Exception:", error)
  }
}

function handleMouseDown(e: MouseEvent) {
  if (!canvasRef.value) return
  const canvasRect = canvasRef.value.getBoundingClientRect()

  // Coordenadas do mouse usam OBRIGATORIAMENTE a escala do CSS do DOM para bater perfeitamente no click
  let s = Number(cssScale.value)
  if (!Number.isFinite(s) || s <= 0) s = 1

  const mouseX = (e.clientX - canvasRect.left) / s
  const mouseY = (e.clientY - canvasRect.top) / s

  draggingIndex = -1
  for (let i = rectangles.value.length - 1; i >= 0; i--) {
    const r = rectangles.value[i]
    if (!r || r.roloId !== currentRollIndex.value) continue

    const rX = Number(r.x) || 0
    const rY = Number(r.y) || 0
    const rW = Number(r.width) || 0
    const rH = Number(r.height) || 0

    if (mouseX >= rX && mouseX <= rX + rW &&
      mouseY >= rY && mouseY <= rY + rH) {

      selectedIndex.value = i
      if (!r.fixed) {
        draggingIndex = i
        offsetX = mouseX - rX
        offsetY = mouseY - rY
      }
      break
    }
  }
  draw()
}

function handleMouseMove(e: MouseEvent) {
  if (draggingIndex === -1 || !canvasRef.value || !currentRoll.value) return

  const draggedRect = rectangles.value[draggingIndex]
  if (!draggedRect) return

  const canvasRect = canvasRef.value.getBoundingClientRect()

  let s = Number(cssScale.value)
  if (!Number.isFinite(s) || s <= 0) s = 1

  const mouseX = (e.clientX - canvasRect.left) / s
  const mouseY = (e.clientY - canvasRect.top) / s
  let newX = mouseX - offsetX
  let newY = mouseY - offsetY

  const largura = Number(currentRoll.value.largura) || 0
  const comprimento = Number(currentRoll.value.comprimento) || 0
  const dW = Number(draggedRect.width) || 0
  const dH = Number(draggedRect.height) || 0

  if (Math.abs(newX) < snapThreshold) newX = 0
  if (Math.abs(newY) < snapThreshold) newY = 0
  if (Math.abs(newX + dW - largura) < snapThreshold) newX = largura - dW
  if (Math.abs(newY + dH - comprimento) < snapThreshold) newY = comprimento - dH

  rectangles.value.forEach((other, index) => {
    if (index === draggingIndex || !other || other.roloId !== currentRollIndex.value) return

    const oX = Number(other.x) || 0
    const oY = Number(other.y) || 0
    const oW = Number(other.width) || 0
    const oH = Number(other.height) || 0

    if (Math.abs(newX - (oX + oW)) < snapThreshold &&
      !(newY + dH < oY || newY > oY + oH)) newX = oX + oW
    if (Math.abs(newX + dW - oX) < snapThreshold &&
      !(newY + dH < oY || newY > oY + oH)) newX = oX - dW
    if (Math.abs(newY - (oY + oH)) < snapThreshold &&
      !(newX + dW < oX || newX > oX + oW)) newY = oY + oH
    if (Math.abs(newY + dH - oY) < snapThreshold &&
      !(newX + dW < oX || newX > oX + oW)) newY = oY - dH
  })

  newX = Math.max(0, Math.min(newX, largura - dW))
  newY = Math.max(0, Math.min(newY, comprimento - dH))

  draggedRect.x = Number.isFinite(newX) ? newX : 0
  draggedRect.y = Number.isFinite(newY) ? newY : 0
  editValues.value.x = Math.round(draggedRect.x)
  editValues.value.y = Math.round(draggedRect.y)
  draw()
}

function handleMouseUp() {
  draggingIndex = -1
}

function updateRectangle() {
  if (selectedIndex.value !== -1) {
    const r = rectangles.value[selectedIndex.value]
    if (!r || r.fixed) return

    r.x = Number(editValues.value.x) || 0
    r.y = Number(editValues.value.y) || 0
    r.width = Number(editValues.value.width) || 0
    r.height = Number(editValues.value.height) || 0
    r.op = editValues.value.op

    if (r.op === -1) r.color = '#94a3b8'
    else if (r.op === 0) r.color = '#8b5cf6'
    draw()
  }
}

function transferirRolo() {
  if (selectedIndex.value !== -1) {
    const r = rectangles.value[selectedIndex.value]
    if (!r || r.fixed) return

    const novoRoloIdx = editValues.value.roloId
    const novoRolo = materiais.value[novoRoloIdx]

    if (!novoRolo) return

    const rWidth = Number(r.width) || 0
    const rHeight = Number(r.height) || 0
    const novoRoloLarg = Number(novoRolo.largura) || 0

    if (rWidth > novoRoloLarg && rHeight > novoRoloLarg) {
      alert('Este corte é largo demais para o rolo de destino!')
      editValues.value.roloId = r.roloId
      return
    }
    if (rWidth > novoRoloLarg && rHeight <= novoRoloLarg) {
      const oldW = rWidth
      r.width = rHeight
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
  if (selectedIndex.value === -1 || !currentRoll.value) return false
  const r = rectangles.value[selectedIndex.value]
  if (!r || r.fixed) return false

  const rWidth = Number(r.width) || 0
  const rHeight = Number(r.height) || 0
  const currLarg = Number(currentRoll.value.largura) || 0
  const currComp = Number(currentRoll.value.comprimento) || 0

  return rHeight <= currLarg && rWidth <= currComp
})

function rotateRectangle() {
  if (selectedIndex.value !== -1 && podeRotacionar.value && currentRoll.value) {
    const r = rectangles.value[selectedIndex.value]
    if (!r) return

    const oldW = Number(r.width) || 0
    const oldH = Number(r.height) || 0
    r.width = oldH
    r.height = oldW

    const rX = Number(r.x) || 0
    const currLarg = Number(currentRoll.value.largura) || 0

    if (rX + r.width > currLarg) r.x = currLarg - r.width
    editValues.value.width = r.width
    editValues.value.height = r.height
    editValues.value.x = r.x
    draw()
  }
}

function deleteRectangle() {
  if (selectedIndex.value !== -1) {
    const r = rectangles.value[selectedIndex.value]
    if (!r || r.fixed) return

    rectangles.value.splice(selectedIndex.value, 1)
    selectedIndex.value = -1
    draw()
  }
}

function deleteRectangleAtIndex(index: number) {
  const r = rectangles.value[index]
  if (!r || r.fixed) return

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
  const r = rectangles.value[index]

  if (r && r.roloId !== currentRollIndex.value) {
    currentRollIndex.value = r.roloId
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
/* 1. TRAVA DO CONTAINER DA PÁGINA EM 100% DA ALTURA */
.erp-container {
  width: 100%;
  height: 100vh;
  /* Altura fixa baseada na tela */
  overflow: hidden;
  /* Remove o scroll nativo da página */
  background-color: #f8f9fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

/* 2. ESTRUTURA FLEX PARA DISTRIBUIR OS ESPAÇOS */
.erp-content {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tabs-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #dee2e6;
  flex-shrink: 0;
  /* Garante que o header das abas não seja esmagado */
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

/* 3. GRID PRINCIPAL QUE OCUPA O RESTO DA TELA */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 20px;
  flex: 1;
  /* Preenche a altura restante do .erp-content */
  min-height: 0;
  /* Regra de Ouro do Flexbox: Permite que os filhos criem scroll */
}

/* CARDS REUTILIZÁVEIS */
.card {
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.card-header {
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
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

/* 4. SEÇÃO DO CANVAS E SCROLL */
.canvas-section {
  height: 100%;
  /* Herda o espaço garantido pelo main-grid */
  min-height: 0;
}

.canvas-viewport {
  flex: 1;
  /* Preenche o espaço dentro do card */
  overflow-y: auto;
  /* AQUI MORA A MÁGICA: Gera o scroll APENAS dentro da chapa */
  overflow-x: hidden;
  background-color: #f0f0f0;
  padding: 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.canvas-container {
  position: relative;
  background: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

canvas {
  display: block;
  cursor: crosshair;
  background-color: white;
  border: 1px solid #ccc;
}

/* 5. PAINEL LATERAL (PROPRIEDADES + LISTA) */
.side-panel {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.properties-card {
  flex-shrink: 0;
}

/* Propriedades tem altura fixa baseado no conteúdo */

/* 6. TABELA COM SCROLL INDEPENDENTE NO PAINEL LATERAL */
.list-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.list-card .card-body.no-padding {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.table-container {
  flex: 1;
  overflow-y: auto;
  /* AQUI MORA A MÁGICA #2: Gera scroll na tabelinha da direita */
}

/* OUTROS ESTILOS MENORES */
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

.op-badge.fixed-badge {
  background: #e2e8f0;
  color: #64748b;
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
  width: 100%;
  box-sizing: border-box;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
}

.erp-input:focus {
  outline: none;
  border-color: #f37021;
}

.erp-input:disabled {
  background-color: #f8f9fa;
  color: #adb5bd;
  cursor: not-allowed;
}

.fixed-notice {
  font-size: 0.8rem;
  color: #dc3545;
  font-style: italic;
  text-align: center;
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

.erp-input:disabled {
  background-color: #f8f9fa;
  color: #adb5bd;
  cursor: not-allowed;
}

.fixed-notice {
  font-size: 0.8rem;
  color: #dc3545;
  font-style: italic;
  text-align: center;
}

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

.btn-success {
  background-color: #15803d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.8rem;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

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
  position: sticky;
  top: 0;
  z-index: 1;
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

.erp-table tr.is-fixed {
  color: #94a3b8;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.status-tag {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.status-tag.fixed {
  background: #e2e8f0;
  color: #64748b;
}

.status-tag.new {
  background: #dcfce7;
  color: #15803d;
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

.full-width {
  grid-column: span 2;
}

.scale-badge {
  background: #e2e8f0;
  color: #475569;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-right: 10px;
}

.roll-mini-tag {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 0.7rem;
  color: #64748b;
}

.erp-table tr.other-roll {
  opacity: 0.6;
}

.erp-table tr.other-roll:hover {
  opacity: 1;
}

/* DEGRADAÇÃO GRACIOSA PARA MOBILE (Telas menores destravam o scroll) */
@media (max-width: 1024px) {
  .erp-container {
    height: auto;
    overflow-y: visible;
  }

  .main-grid {
    grid-template-columns: 1fr;
    display: flex;
    flex-direction: column;
  }

  .canvas-section {
    height: 600px;
    flex-shrink: 0;
  }

  .side-panel {
    height: auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .list-card {
    height: 400px;
  }
}

@media (max-width: 768px) {
  .side-panel {
    grid-template-columns: 1fr;
  }
}
</style>