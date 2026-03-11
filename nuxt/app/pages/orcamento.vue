<template>
  <div class="erp-container">
    <div class="erp-content">
      <!-- Cabeçalho do Orçamento -->
      <div class="tabs-section">
        <div class="header-titles">
          <h2 style="margin: 0; color: #1e3a8a; font-size: 1.2rem;">Orçamento - Correias Manufaturadas</h2>
          <span style="font-size: 0.8rem; color: #64748b;">Painel de Engenharia (Visão Completa)</span>
        </div>
        <div class="tabs-actions">
          <button class="btn-secondary" @click="updateDraws" style="margin-right: 10px;">ATUALIZAR VISTAS</button>
          <button class="btn-success" @click="salvarOrcamento">SALVAR PRODUTO</button>
        </div>
      </div>

      <div class="main-grid">
        <!-- Área dos Desenhos Técnicos (Lado Esquerdo - Sem Scroll) -->
        <section class="canvas-section card">
          <div class="card-header">
            <h2 class="card-title">Vistas Técnicas Simultâneas</h2>
            <div class="card-tools">
              <span class="scale-badge" style="background:#dbeafe; color:#1e3a8a;">
                Largura: {{ configCorreia.largura }} mm
              </span>
            </div>
          </div>
          
          <div class="canvas-viewport">
            <div class="views-wrapper" ref="viewsContainer">
              
              <!-- Vista 1: Transversal -->
              <div class="view-block transversal">
                <h3 class="view-title">1. Perfil Transversal (Corte Frontal)</h3>
                <div class="canvas-container" ref="refTransContainer">
                  <canvas ref="canvasTransversal"></canvas>
                </div>
              </div>

              <!-- Vista 3: Lateral (Colocada ao lado da transversal) -->
              <div class="view-block lateral">
                <h3 class="view-title">3. Vista Lateral (Perfil Longitudinal)</h3>
                <div class="canvas-container" ref="refLatContainer">
                  <canvas ref="canvasLateral"></canvas>
                </div>
              </div>

              <!-- Vista 2: Superior (Ocupa a linha de baixo inteira na horizontal) -->
              <div class="view-block superior">
                <h3 class="view-title">2. Vista Superior (Topo - Segmento Máx 1.5m)</h3>
                <div class="canvas-container" ref="refSupContainer">
                  <canvas ref="canvasSuperior"></canvas>
                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- Painel de Propriedades (Lado Direito - Mantém Scroll Interno) -->
        <aside class="side-panel">
          
          <!-- Aba 1: Correia Base -->
          <div class="card properties-card">
            <div class="card-header">
              <h2 class="card-title">Correia Base</h2>
            </div>
            <div class="card-body">
              <div class="property-form">
                <div class="form-grid">
                  <div class="form-group full-width">
                    <label>Produto (Correia)</label>
                    <select class="erp-input">
                      <option>PU VOLTA BELTING - HOMOGÊNEAS</option>
                      <option>PVC SANITÁRIO</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Largura (mm)</label>
                    <input type="number" v-model.number="configCorreia.largura" @input="updateDraws" class="erp-input" />
                  </div>
                  <div class="form-group">
                    <label>Comprimento (mm)</label>
                    <input type="number" v-model.number="configCorreia.comprimento" @input="updateDraws" class="erp-input" />
                  </div>
                  <div class="form-group">
                    <label>Acabamento</label>
                    <select class="erp-input" v-model="configCorreia.acabamento">
                      <option>01 - Aberta</option>
                      <option>02 - Fechada</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Emenda</label>
                    <select class="erp-input" v-model="configCorreia.emenda">
                      <option>01 - Padrão</option>
                      <option>02 - Especial</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Grampo</label>
                    <input type="text" v-model="configCorreia.grampo" class="erp-input" />
                  </div>
                  <div class="form-group">
                    <label>Qtd. Segmentos</label>
                    <input type="number" v-model.number="configCorreia.qtdSegmentos" class="erp-input" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Abas de Acessórios -->
          <div class="card accessories-card">
            <div class="tabs-navigation accessories-tabs">
              <button class="erp-tab mini" :class="{ active: activeTab === 'talisca' }" @click="activeTab = 'talisca'">Talisca</button>
              <button class="erp-tab mini" :class="{ active: activeTab === 'guiasup' }" @click="activeTab = 'guiasup'">Guia Sup.</button>
              <button class="erp-tab mini" :class="{ active: activeTab === 'guiainf' }" @click="activeTab = 'guiainf'">Guia Inf.</button>
              <button class="erp-tab mini" :class="{ active: activeTab === 'sidewall' }" @click="activeTab = 'sidewall'">SideWall</button>
              <button class="erp-tab mini" :class="{ active: activeTab === 'furos' }" @click="activeTab = 'furos'">Furos</button>
              <button class="erp-tab mini" :class="{ active: activeTab === 'maofrancesa' }" @click="activeTab = 'maofrancesa'">Mão Fran.</button>
            </div>
            
            <div class="card-body scrollable-body">
              
              <!-- Aba: Taliscas -->
              <div v-if="activeTab === 'talisca'" class="property-form">
                <div class="switch-container mb-10">
                  <input type="checkbox" v-model="configTalisca.ativa" @change="updateDraws"> <label>Incluir Taliscas</label>
                </div>
                <div class="form-grid" :class="{ 'disabled-section': !configTalisca.ativa }">
                  <div class="form-group full-width"><label>Produto</label><select class="erp-input"><option>FMB 5</option></select></div>
                  <div class="form-group"><label>Altura (mm)</label><input type="number" v-model.number="configTalisca.altura" @input="updateDraws" class="erp-input" /></div>
                  <div class="form-group"><label>Passo Nominal (mm)</label><input type="number" v-model.number="configTalisca.passoNominal" @input="updateDraws" class="erp-input" /></div>
                  <div class="form-group"><label>Rec Lat 1 (mm)</label><input type="number" v-model.number="configTalisca.recLat1" @input="updateDraws" class="erp-input" /></div>
                  <div class="form-group"><label>Rec Lat 2 (mm)</label><input type="number" v-model.number="configTalisca.recLat2" @input="updateDraws" class="erp-input" /></div>
                  <div class="form-group"><label>Segmentos p/ Fileira</label><input type="number" v-model.number="configTalisca.segmentosFileira" @input="updateDraws" class="erp-input" /></div>
                  <div class="form-group"><label>Vão (mm)</label><input type="number" v-model.number="configTalisca.vao" @input="updateDraws" class="erp-input" /></div>
                  <div class="form-group"><label>Número de Fileiras</label><input type="number" v-model.number="configTalisca.numeroFileiras" class="erp-input bg-readonly" readonly /></div>
                </div>
              </div>

              <!-- Aba: Guia Superior -->
              <div v-if="activeTab === 'guiasup'" class="property-form">
                 <div class="switch-container mb-10">
                  <input type="checkbox" v-model="configGuiaSup.ativa" @change="updateDraws"> <label>Incluir Guia Superior</label>
                </div>
                <div class="form-grid" :class="{ 'disabled-section': !configGuiaSup.ativa }">
                  <div class="form-group"><label>Distância da Borda (mm)</label><input type="number" v-model.number="configGuiaSup.distBorda" @input="updateDraws" class="erp-input" /></div>
                </div>
              </div>

              <!-- Aba: Guia Inferior -->
              <div v-if="activeTab === 'guiainf'" class="property-form">
                 <div class="switch-container mb-10">
                  <input type="checkbox" v-model="configGuiaInf.ativa" @change="updateDraws"> <label>Incluir Guia Inferior</label>
                </div>
                <div class="form-grid" :class="{ 'disabled-section': !configGuiaInf.ativa }">
                  <div class="form-group full-width"><label>Produto (Guia)</label><select class="erp-input"><option>VL 13/A</option></select></div>
                  <div class="form-group"><label>Distância da Borda (mm)</label><input type="number" v-model.number="configGuiaInf.distBorda" @input="updateDraws" class="erp-input" /></div>
                  <div class="form-group full-width"><label>Configuração</label>
                    <select v-model="configGuiaInf.configuracao" @change="updateDraws" class="erp-input">
                      <option value="central">Central</option>
                      <option value="1lateral">1 Lateral</option>
                      <option value="2laterais">2 Laterais</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Aba: SideWall -->
              <div v-if="activeTab === 'sidewall'" class="property-form">
                 <div class="switch-container mb-10">
                  <input type="checkbox" v-model="configSidewall.ativa" @change="updateDraws"> <label>Incluir SideWall</label>
                </div>
                <div class="form-grid" :class="{ 'disabled-section': !configSidewall.ativa }">
                  <div class="form-group full-width"><label>Produto (SideWall)</label><select class="erp-input"><option>SWB 30</option></select></div>
                  <div class="form-group"><label>Dist. da Borda à Base</label><input type="number" v-model.number="configSidewall.distBordaBase" @input="updateDraws" class="erp-input" /></div>
                  <div class="form-group"><label>Configuração</label>
                    <select v-model="configSidewall.configuracao" @change="updateDraws" class="erp-input">
                      <option value="lateral">Lateral (Duas Bordas)</option>
                      <option value="central">Central</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Aba: Furos -->
              <div v-if="activeTab === 'furos'" class="property-form">
                 <div class="switch-container mb-10">
                  <input type="checkbox" v-model="configFuros.ativa" @change="updateDraws"> <label>Incluir Furação</label>
                </div>
                <div class="form-grid" :class="{ 'disabled-section': !configFuros.ativa }">
                  <div class="form-group"><label>Distância da Borda (mm)</label><input type="number" v-model.number="configFuros.distBorda" @input="updateDraws" class="erp-input" /></div>
                  <div class="form-group"><label>Diâmetro Furo 1 (mm)</label><input type="number" v-model.number="configFuros.diametro1" @input="updateDraws" class="erp-input" /></div>
                  <div class="form-group"><label>Passo Longitudinal (mm)</label><input type="number" v-model.number="configFuros.passo" @input="updateDraws" class="erp-input" /></div>
                </div>
              </div>

              <!-- Aba: Mão Francesa -->
              <div v-if="activeTab === 'maofrancesa'" class="property-form">
                 <div class="switch-container mb-10">
                  <input type="checkbox" v-model="configMaoFrancesa.ativa" @change="updateDraws"> <label>Incluir Mão Francesa</label>
                </div>
                <div class="form-grid" :class="{ 'disabled-section': !configMaoFrancesa.ativa }">
                  <div class="form-group"><label>Altura (mm)</label><input type="number" v-model.number="configMaoFrancesa.altura" @input="updateDraws" class="erp-input" /></div>
                  <div class="form-group"><label>Base Inferior (mm)</label><input type="number" v-model.number="configMaoFrancesa.baseInf" @input="updateDraws" class="erp-input" /></div>
                  <div class="form-group"><label>Recuo Apoio (mm)</label><input type="number" v-model.number="configMaoFrancesa.recuo" @input="updateDraws" class="erp-input" /></div>
                </div>
              </div>

            </div>
          </div>

          <!-- Card de Resumo / Preço Final -->
          <div class="card price-card">
            <div class="card-header">
              <h2 class="card-title">Memorial de Cálculo</h2>
            </div>
            <div class="card-body">
              <div class="price-grid">
                <span>Correia Base:</span> <span>R$ 1.250,00</span>
                <span v-if="configTalisca.ativa">Taliscas:</span> <span v-if="configTalisca.ativa">R$ 480,50</span>
                <span v-if="configSidewall.ativa">SideWall:</span> <span v-if="configSidewall.ativa">R$ 320,00</span>
                <span v-if="configGuiaInf.ativa || configGuiaSup.ativa">Guias Inf/Sup:</span> <span v-if="configGuiaInf.ativa || configGuiaSup.ativa">R$ 150,00</span>
                <span>Mão de Obra:</span> <span>R$ 250,00</span>
                <strong class="total-row">Valor Total:</strong> <strong class="total-row">R$ {{ calcularPrecoFicticio() }}</strong>
              </div>
            </div>
          </div>

        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, reactive } from 'vue'

// ================= ESTADOS DA TELA =================
const activeTab = ref('talisca')
const canvasTransversal = ref<HTMLCanvasElement | null>(null)
const canvasSuperior = ref<HTMLCanvasElement | null>(null)
const canvasLateral = ref<HTMLCanvasElement | null>(null)

// Referências dos Containers Físicos na Grid para calcular a Escala Responsiva
const refTransContainer = ref<HTMLElement | null>(null)
const refSupContainer = ref<HTMLElement | null>(null)
const refLatContainer = ref<HTMLElement | null>(null)
const viewsContainer = ref<HTMLElement | null>(null)

// ================= ESTADOS DO ORÇAMENTO =================
const configCorreia = ref({ largura: 1000, comprimento: 5200, acabamento: '01 - Aberta', emenda: '01 - Padrão', grampo: '', qtdSegmentos: 1 })
const configTalisca = ref({ ativa: true, altura: 100, recLat1: 50, recLat2: 50, passoNominal: 400, passoAjuste: 0, configuracao: 'reta', segmentosFileira: 1, vao: 0, numeroFileiras: 0, compSegmento: 0, observacao: '' })
const configGuiaSup = ref({ ativa: false, distBorda: 50, distEntreGuias: 0 })
const configGuiaInf = ref({ ativa: false, distBorda: 25, distEntreGuias: 0, configuracao: '2laterais' })
const configSidewall = ref({ ativa: false, distBordaBase: 25, configuracao: 'lateral' })
const configFuros = ref({ ativa: false, tipo: '1', distBorda: 50, diametro1: 15, diametro2: 0, passo: 200, qtdFileiras: 2, qtdCarreira: 0, observacoes: '' })
const configMaoFrancesa = ref({ ativa: true, tipo: '1', altura: 80, baseInf: 60, baseSup: 0, flanco: 0, recuo: 20, vao: 60 })

// ================= GESTÃO DE MÚLTIPLAS VISTAS (SEM SCROLL) =================
const dims = reactive({
  trans: { w: 1, h: 1, scale: 1 },
  sup: { w: 1, h: 1, scale: 1 },
  lat: { w: 1, h: 1, scale: 1 }
})

let resizeObserver: ResizeObserver | null = null

function calcularDimensoesEAtualizar() {
  const larg = Number(configCorreia.value.largura) || 1000
  const comp = Math.min(Number(configCorreia.value.comprimento) || 1000, 1500) // Máximo 1.5m visual
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1

  // === VISTA 1: TRANSVERSAL (Foco na Largura) ===
  if (refTransContainer.value && canvasTransversal.value) {
    const cW = refTransContainer.value.clientWidth
    const cH = refTransContainer.value.clientHeight
    const wLogTrans = larg * 1.4 // 40% margem p/ cotas
    const hLogTrans = 450
    // Encontra a escala que faz caber o desenho inteiro no container fixo
    const scale = Math.min(cW / wLogTrans, cH / hLogTrans) * 0.95
    
    dims.trans.w = cW * dpr; dims.trans.h = cH * dpr; dims.trans.scale = scale * dpr
    canvasTransversal.value.width = dims.trans.w; canvasTransversal.value.height = dims.trans.h
  }

  // === VISTA 2: SUPERIOR (Deitada: Foco Comprimento(X) x Largura(Y)) ===
  if (refSupContainer.value && canvasSuperior.value) {
    const cW = refSupContainer.value.clientWidth
    const cH = refSupContainer.value.clientHeight
    const wLogSup = comp * 1.4
    const hLogSup = larg * 1.4
    const scale = Math.min(cW / wLogSup, cH / hLogSup) * 0.95
    
    dims.sup.w = cW * dpr; dims.sup.h = cH * dpr; dims.sup.scale = scale * dpr
    canvasSuperior.value.width = dims.sup.w; canvasSuperior.value.height = dims.sup.h
  }

  // === VISTA 3: LATERAL (Deitada: Foco Comprimento(X) x Altura(Y)) ===
  if (refLatContainer.value && canvasLateral.value) {
    const cW = refLatContainer.value.clientWidth
    const cH = refLatContainer.value.clientHeight
    const wLogLat = comp * 1.4
    const hLogLat = 450
    const scale = Math.min(cW / wLogLat, cH / hLogLat) * 0.95
    
    dims.lat.w = cW * dpr; dims.lat.h = cH * dpr; dims.lat.scale = scale * dpr
    canvasLateral.value.width = dims.lat.w; canvasLateral.value.height = dims.lat.h
  }

  drawAll()
}

onMounted(async () => {
  await nextTick()
  if (viewsContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      // Debounce simples p/ Resize
      requestAnimationFrame(() => calcularDimensoesEAtualizar())
    })
    resizeObserver.observe(viewsContainer.value)
  }
  setTimeout(() => calcularDimensoesEAtualizar(), 200)
})

onUnmounted(() => { if (resizeObserver) resizeObserver.disconnect() })

function updateDraws() {
  calcularDimensoesEAtualizar()
}

// ================= MOTOR DE DESENHO TÉCNICO E COTAS =================

// Helper para Fundo Técnico
function setEstiloFundo(ctx, w, h, s) {
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 1
  for(let x=0; x<w; x+=20*s) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
  for(let y=0; y<h; y+=20*s) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
}

// Helper Robusto para Cotas (Agora aceita desenhar na Horizontal e Vertical perfeitamente)
function drawCota(ctx, x1, y1, x2, y2, text, offset, s, color = '#475569') {
  if (!Number.isFinite(x1) || !Number.isFinite(y1) || !Number.isFinite(x2) || !Number.isFinite(y2)) return;
  
  ctx.save()
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.2 * s
  
  const fontSize = Math.max(10, 12 * s) 
  ctx.font = `bold ${fontSize}px monospace`
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'

  const dx = x2 - x1; const dy = y2 - y1
  const angle = Math.atan2(dy, dx)
  const nx = -Math.sin(angle); const ny = Math.cos(angle) // Vetor normal para offset
  
  const cx1 = x1 + offset * nx * s; const cy1 = y1 + offset * ny * s
  const cx2 = x2 + offset * nx * s; const cy2 = y2 + offset * ny * s

  // Linhas de extensão
  ctx.setLineDash([4 * s, 4 * s]); ctx.beginPath()
  ctx.moveTo(x1, y1); ctx.lineTo(cx1, cy1); ctx.moveTo(x2, y2); ctx.lineTo(cx2, cy2)
  ctx.stroke(); ctx.setLineDash([])

  // Linha principal da Cota e Ticks 45º
  ctx.beginPath(); ctx.moveTo(cx1, cy1); ctx.lineTo(cx2, cy2); ctx.stroke()
  const tick = 6 * s; const tA = angle - Math.PI/4
  ctx.beginPath()
  ctx.moveTo(cx1 - tick*Math.cos(tA), cy1 - tick*Math.sin(tA)); ctx.lineTo(cx1 + tick*Math.cos(tA), cy1 + tick*Math.sin(tA))
  ctx.moveTo(cx2 - tick*Math.cos(tA), cy2 - tick*Math.sin(tA)); ctx.lineTo(cx2 + tick*Math.cos(tA), cy2 + tick*Math.sin(tA))
  ctx.stroke()

  // Posiciona Texto
  ctx.translate((cx1 + cx2) / 2, (cy1 + cy2) / 2)
  let textAngle = angle
  if (textAngle > Math.PI/2 || textAngle < -Math.PI/2) textAngle += Math.PI
  ctx.rotate(textAngle)
  
  const tw = ctx.measureText(text).width + 8*s
  const th = fontSize + 4*s
  ctx.fillStyle = '#ffffff'; ctx.fillRect(-tw/2, -th/2 - 10*s, tw, th)
  ctx.fillStyle = color; ctx.fillText(text, 0, -10*s)
  ctx.restore()
}

function drawAll() {
  drawTransversal()
  drawSuperior()
  drawLateral()
}

// 1. VISTA TRANSVERSAL (Corte Frontal)
function drawTransversal() {
  if (!canvasTransversal.value) return
  const ctx = canvasTransversal.value.getContext('2d'); if (!ctx) return
  const s = dims.trans.scale; const w = dims.trans.w; const h = dims.trans.h
  setEstiloFundo(ctx, w, h, s)

  const larg = Number(configCorreia.value.largura) * s
  const offsetX = (w - larg) / 2
  const beltY = h / 2 + 50 * s; const beltThick = 8 * s

  // Correia
  ctx.fillStyle = '#e0f2fe'; ctx.strokeStyle = '#1e3a8a'; ctx.lineWidth = 2 * s
  ctx.fillRect(offsetX, beltY, larg, beltThick); ctx.strokeRect(offsetX, beltY, larg, beltThick)
  drawCota(ctx, offsetX, beltY + beltThick, offsetX + larg, beltY + beltThick, configCorreia.value.largura + ' mm', 40, s, '#1e3a8a')

  // Guias Inf
  if (configGuiaInf.value.ativa) {
    const dist = Number(configGuiaInf.value.distBorda) * s
    const gwT = 13 * s; const gwB = 8 * s; const gh = 8 * s
    ctx.fillStyle = '#94a3b8'; ctx.strokeStyle = '#334155'
    
    const drawGuia = (xPos, showCota) => {
      ctx.beginPath(); ctx.moveTo(xPos, beltY + beltThick); ctx.lineTo(xPos + gwT, beltY + beltThick);
      ctx.lineTo(xPos + gwT - ((gwT-gwB)/2), beltY + beltThick + gh); ctx.lineTo(xPos + ((gwT-gwB)/2), beltY + beltThick + gh)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      if (showCota && configGuiaInf.value.configuracao !== 'central') {
        drawCota(ctx, offsetX, beltY + beltThick, xPos + (gwT/2), beltY + beltThick, configGuiaInf.value.distBorda + ' mm', 80, s)
      }
    }
    if (configGuiaInf.value.configuracao === 'central') drawGuia(offsetX + (larg/2) - (gwT/2), false)
    if (['1lateral', '2laterais', 'multiplas'].includes(configGuiaInf.value.configuracao)) {
      drawGuia(offsetX + dist, true)
      if (configGuiaInf.value.configuracao !== '1lateral') drawGuia(offsetX + larg - dist - gwT, false)
    }
  }

  // Guias Sup
  if (configGuiaSup.value.ativa) {
    const dist = Number(configGuiaSup.value.distBorda) * s
    const gw = 10 * s; const gh = 8 * s
    ctx.fillStyle = '#1d4ed8'; ctx.strokeStyle = '#1e3a8a'
    const drawGuiaSup = (xPos) => { ctx.fillRect(xPos, beltY - gh, gw, gh); ctx.strokeRect(xPos, beltY - gh, gw, gh) }
    drawGuiaSup(offsetX + dist)
    drawGuiaSup(offsetX + larg - dist - gw)
  }

  // Taliscas & Mão Francesa
  if (configTalisca.value.ativa) {
    const altT = Number(configTalisca.value.altura) * s
    const r1 = Number(configTalisca.value.recLat1) * s; const r2 = Number(configTalisca.value.recLat2) * s
    const vao = Number(configTalisca.value.vao) * s
    const wT = larg - r1 - r2
    ctx.fillStyle = '#bae6fd'; ctx.strokeStyle = '#1d4ed8'
    
    const drawTaliscaSection = (xS, width, isLeft) => {
      ctx.fillRect(xS, beltY - altT, width, altT); ctx.strokeRect(xS, beltY - altT, width, altT)
      if (isLeft) drawCota(ctx, xS, beltY, xS, beltY - altT, configTalisca.value.altura + ' mm', -30, s, '#c2410c')

      // Mão Francesa Transversal
      if (configMaoFrancesa.value.ativa) {
        ctx.fillStyle = '#cbd5e1'; ctx.strokeStyle = '#475569'
        const mfAlt = Number(configMaoFrancesa.value.altura) * s; const mfThickness = 8 * s
        const numMF = Math.max(2, Math.floor(width / (150 * s)) + 1)
        const stepMF = (width - mfThickness) / (numMF - 1 || 1)
        for(let i=0; i<numMF; i++) {
          const mfx = xS + (stepMF * i)
          ctx.fillRect(mfx, beltY - mfAlt, mfThickness, mfAlt); ctx.strokeRect(mfx, beltY - mfAlt, mfThickness, mfAlt)
        }
      }
    }

    if (configTalisca.value.segmentosFileira > 1 && vao > 0) {
      const wP = (wT - vao)/2
      drawTaliscaSection(offsetX + r1, wP, true); drawTaliscaSection(offsetX + r1 + wP + vao, wP, false)
      drawCota(ctx, offsetX, beltY, offsetX + r1, beltY, configTalisca.value.recLat1 + ' mm', -(altT + 30*s), s, '#c2410c')
      drawCota(ctx, offsetX + r1 + wP, beltY, offsetX + r1 + wP + vao, beltY, configTalisca.value.vao + ' mm', -(altT + 30*s), s, '#c2410c')
    } else {
      drawTaliscaSection(offsetX + r1, wT, true)
      drawCota(ctx, offsetX, beltY, offsetX + r1, beltY, configTalisca.value.recLat1 + ' mm', -(altT + 30*s), s, '#c2410c')
      drawCota(ctx, offsetX + r1 + wT, beltY, offsetX + larg, beltY, configTalisca.value.recLat2 + ' mm', -(altT + 30*s), s, '#c2410c')
    }
  }

  // SideWall
  if (configSidewall.value.ativa) {
    ctx.fillStyle = '#bbf7d0'; ctx.strokeStyle = '#15803d'
    const sW = 30 * s; const sH = 60 * s; const d = Number(configSidewall.value.distBordaBase) * s
    const drawSW = (x, isLeft) => { 
      ctx.fillRect(x, beltY - sH, sW, sH); ctx.strokeRect(x, beltY - sH, sW, sH) 
      if (isLeft) drawCota(ctx, offsetX, beltY, x, beltY, configSidewall.value.distBordaBase + ' mm', -(sH + 20*s), s, '#15803d')
    }
    if (['lateral', 'esquerda'].includes(configSidewall.value.configuracao)) drawSW(offsetX + d, true)
    if (['lateral', 'direita'].includes(configSidewall.value.configuracao)) drawSW(offsetX + larg - d - sW, false)
  }
}

// 2. VISTA SUPERIOR (Topo - Horizontal)
function drawSuperior() {
  if (!canvasSuperior.value) return
  const ctx = canvasSuperior.value.getContext('2d'); if (!ctx) return
  const s = dims.sup.scale; const w = dims.sup.w; const h = dims.sup.h
  setEstiloFundo(ctx, w, h, s)

  const larg = Number(configCorreia.value.largura) * s
  const compVisual = Math.min(Number(configCorreia.value.comprimento), 1500) * s
  
  const offsetX = (w - compVisual) / 2
  const offsetY = (h - larg) / 2

  // Correia
  ctx.fillStyle = '#e0f2fe'; ctx.strokeStyle = '#1e3a8a'; ctx.lineWidth = 2 * s
  ctx.fillRect(offsetX, offsetY, compVisual, larg)
  ctx.strokeRect(offsetX, offsetY, compVisual, larg)

  drawCota(ctx, offsetX, offsetY + larg, offsetX + compVisual, offsetY + larg, `Comprimento Visível: ${Math.min(configCorreia.value.comprimento, 1500)} mm`, 40, s, '#1e3a8a')

  // Guias Inf
  if (configGuiaInf.value.ativa) {
    ctx.strokeStyle = '#475569'; ctx.setLineDash([10*s, 10*s]); ctx.lineWidth = 13 * s
    const d = Number(configGuiaInf.value.distBorda) * s; const gw = 13 * s
    const drawLine = (y) => { ctx.beginPath(); ctx.moveTo(offsetX, y); ctx.lineTo(offsetX + compVisual, y); ctx.stroke() }
    
    if (configGuiaInf.value.configuracao === 'central') drawLine(offsetY + (larg/2))
    if (['1lateral', '2laterais', 'multiplas'].includes(configGuiaInf.value.configuracao)) {
      drawLine(offsetY + d + gw/2)
      if (configGuiaInf.value.configuracao !== '1lateral') drawLine(offsetY + larg - d - gw/2)
    }
    ctx.setLineDash([])
  }

  // Guias Sup
  if (configGuiaSup.value.ativa) {
    ctx.fillStyle = '#1d4ed8';
    const d = Number(configGuiaSup.value.distBorda) * s; const gw = 10 * s
    ctx.fillRect(offsetX, offsetY + d, compVisual, gw)
    ctx.fillRect(offsetX, offsetY + larg - d - gw, compVisual, gw)
  }

  // Furos
  if (configFuros.value.ativa && configFuros.value.passo > 0) {
    ctx.fillStyle = '#000000'
    const passoX = Number(configFuros.value.passo) * s
    const dY = Number(configFuros.value.distBorda) * s
    const raio = Math.max(2, (Number(configFuros.value.diametro1) / 2) * s)
    
    drawCota(ctx, offsetX + passoX, offsetY + dY, offsetX + 2*passoX, offsetY + dY, configFuros.value.passo + ' mm', -40, s, '#000')

    for (let x = offsetX + passoX; x < offsetX + compVisual; x += passoX) {
      if(!Number.isFinite(x)) continue
      ctx.beginPath(); ctx.arc(x, offsetY + dY, raio, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(x, offsetY + larg - dY, raio, 0, Math.PI * 2); ctx.fill()
    }
  }

  // Taliscas & Mão Francesa
  if (configTalisca.value.ativa && configTalisca.value.passoNominal > 0) {
    const passoX = Number(configTalisca.value.passoNominal) * s
    const r1 = Number(configTalisca.value.recLat1) * s; const r2 = Number(configTalisca.value.recLat2) * s
    const vao = Number(configTalisca.value.vao) * s
    const wT = larg - r1 - r2
    const th = 10 * s 
    
    configTalisca.value.numeroFileiras = Math.floor(configCorreia.value.comprimento / configTalisca.value.passoNominal)
    drawCota(ctx, offsetX + passoX, offsetY + larg, offsetX + 2*passoX, offsetY + larg, configTalisca.value.passoNominal + ' mm', 80, s, '#c2410c')

    for (let x = offsetX + passoX; x < offsetX + compVisual; x += passoX) {
      if(!Number.isFinite(x)) continue
      
      const drawTopTaliscaAndMf = (yStart, width) => {
        // Mão Francesa vista de cima (Retângulos esticados à esquerda da talisca no eixo X)
        if (configMaoFrancesa.value.ativa) {
          ctx.fillStyle = '#cbd5e1'; ctx.strokeStyle = '#475569'; ctx.lineWidth = 1 * s
          const mfBase = Number(configMaoFrancesa.value.baseInf) * s
          const mfThickness = 8 * s
          const numMF = Math.max(2, Math.floor(width / (150 * s)) + 1)
          const stepMF = (width - mfThickness) / (numMF - 1 || 1)
          
          for(let i=0; i<numMF; i++) {
            const mfy = yStart + (stepMF * i)
            ctx.fillRect(x - th/2 - mfBase, mfy, mfBase, mfThickness)
            ctx.strokeRect(x - th/2 - mfBase, mfy, mfBase, mfThickness)
          }
        }
        
        ctx.fillStyle = '#f97316'; ctx.strokeStyle = '#c2410c'; ctx.lineWidth = 1.5 * s
        ctx.fillRect(x - th/2, yStart, th, width)
        ctx.strokeRect(x - th/2, yStart, th, width)
      }

      if (configTalisca.value.segmentosFileira > 1 && vao > 0) {
        const wP = (wT - vao)/2
        drawTopTaliscaAndMf(offsetY + r1, wP)
        drawTopTaliscaAndMf(offsetY + r1 + wP + vao, wP)
      } else {
        drawTopTaliscaAndMf(offsetY + r1, wT)
      }
    }
  }

  // SideWall
  if (configSidewall.value.ativa) {
    ctx.fillStyle = '#22c55e'; ctx.strokeStyle = '#15803d'
    const sW = 30 * s; const d = Number(configSidewall.value.distBordaBase) * s
    const drawSW = (y) => {
      ctx.fillRect(offsetX, y, compVisual, sW); ctx.strokeRect(offsetX, y, compVisual, sW)
      for(let x=offsetX; x < offsetX+compVisual; x+=10*s) {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x+5*s, y+sW); ctx.stroke()
      }
    }
    if (['lateral', 'esquerda'].includes(configSidewall.value.configuracao)) drawSW(offsetY + d)
    if (['lateral', 'direita'].includes(configSidewall.value.configuracao)) drawSW(offsetY + larg - d - sW)
  }
}

// 3. VISTA LATERAL (Perfil Longitudinal)
function drawLateral() {
  if (!canvasLateral.value) return
  const ctx = canvasLateral.value.getContext('2d'); if (!ctx) return
  const s = dims.lat.scale; const w = dims.lat.w; const h = dims.lat.h

  setEstiloFundo(ctx, w, h, s)
  const compVisual = Math.min(Number(configCorreia.value.comprimento), 1500) * s
  const offsetX = (w - compVisual) / 2 
  const beltY = h / 2 + 50 * s; const beltThick = 8 * s

  // Correia Perfil
  ctx.fillStyle = '#e0f2fe'; ctx.strokeStyle = '#1e3a8a'; ctx.lineWidth = 2 * s
  ctx.fillRect(offsetX, beltY, compVisual, beltThick)
  ctx.strokeRect(offsetX, beltY, compVisual, beltThick)

  // Guia Inf
  if (configGuiaInf.value.ativa) {
    ctx.fillStyle = '#94a3b8'; ctx.strokeStyle = '#334155'
    ctx.fillRect(offsetX, beltY + beltThick, compVisual, 8 * s)
  }

  // Guia Sup
  if (configGuiaSup.value.ativa) {
    ctx.fillStyle = '#1d4ed8'
    ctx.fillRect(offsetX, beltY - (8*s), compVisual, 8 * s)
  }

  // SideWall (Translúcido)
  if (configSidewall.value.ativa && ['lateral', 'esquerda'].includes(configSidewall.value.configuracao)) {
    ctx.fillStyle = 'rgba(187, 247, 208, 0.6)'; ctx.strokeStyle = 'rgba(21, 128, 61, 0.8)'
    const sH = 60 * s
    ctx.fillRect(offsetX, beltY - sH, compVisual, sH)
    ctx.strokeRect(offsetX, beltY - sH, compVisual, sH)
  }

  // Taliscas & Mão Francesa
  if (configTalisca.value.ativa && configTalisca.value.passoNominal > 0) {
    const altT = Number(configTalisca.value.altura) * s
    const passoX = Number(configTalisca.value.passoNominal) * s
    const th = 10 * s
    let firstMFTrawn = false

    for (let x = offsetX + passoX; x < offsetX + compVisual; x += passoX) {
      if(!Number.isFinite(x)) continue
      
      // Mão Francesa Perfil (Triângulo apoiando atrás da talisca - à esquerda)
      if (configMaoFrancesa.value.ativa) {
        const mfB = Number(configMaoFrancesa.value.baseInf) * s; const mfA = Number(configMaoFrancesa.value.altura) * s
        ctx.fillStyle = '#cbd5e1'; ctx.strokeStyle = '#475569'
        
        ctx.beginPath()
        ctx.moveTo(x - th/2, beltY)           // Base inferior da Talisca
        ctx.lineTo(x - th/2, beltY - mfA)     // Sobe pela Talisca
        ctx.lineTo(x - th/2 - mfB, beltY)     // Desce esticando para trás
        ctx.closePath(); ctx.fill(); ctx.stroke()

        if (!firstMFTrawn) {
          drawCota(ctx, x - th/2 - mfB, beltY, x - th/2, beltY, configMaoFrancesa.value.baseInf + ' mm', - (mfA + 30*s), s, '#475569')
          firstMFTrawn = true
        }
      }
      
      // Talisca Perfil
      ctx.fillStyle = '#bae6fd'; ctx.strokeStyle = '#1d4ed8'
      ctx.fillRect(x - th/2, beltY - altT, th, altT)
      ctx.strokeRect(x - th/2, beltY - altT, th, altT)
    }
  }
}

function calcularPrecoFicticio() {
  let base = 1250
  if (configTalisca.value.ativa) base += 480.50
  if (configSidewall.value.ativa) base += 320.00
  if (configGuiaInf.value.ativa || configGuiaSup.value.ativa) base += 150.00
  base += 250
  return base.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

function salvarOrcamento() {
  alert('Orçamento salvo com sucesso! O Memorial de cálculo foi anexado ao Pedido/Orçamento UNO.')
}
</script>

<style scoped>
/* CONTAINERS GERAIS */
.erp-container { 
  width: 100%; height: 100vh; overflow: hidden; background-color: #f8f9fa; font-family: 'Segoe UI', sans-serif; color: #333; 
}
.erp-content { padding: 20px; max-width: 1800px; margin: 0 auto; height: 100%; display: flex; flex-direction: column; }
.tabs-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #dee2e6; flex-shrink: 0; padding-bottom: 10px; }
.main-grid { display: grid; grid-template-columns: 1fr 450px; gap: 20px; flex: 1; min-height: 0; }
.card { background: white; border-radius: 4px; border: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); display: flex; flex-direction: column; }
.card-header { padding: 12px 15px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
.card-title { font-size: 0.9rem; font-weight: 700; margin: 0; text-transform: uppercase; color: #444; }

/* ÁREA DE CANVASES (SEM SCROLL) */
.canvas-section { height: 100%; min-height: 0; min-width: 0; display: flex; flex-direction: column;}
.canvas-viewport { 
  flex: 1; 
  background-color: #cbd5e1; 
  padding: 15px; 
  box-sizing: border-box;
  display: flex;
  min-height: 0;
}

/* CSS GRID RESPONSIVO PARA AS 3 VISTAS */
.views-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 15px;
  width: 100%;
  height: 100%;
}
.view-block { display: flex; flex-direction: column; width: 100%; height: 100%; min-height: 0; min-width: 0; }
.view-block.transversal { grid-column: 1 / 2; grid-row: 1 / 2; }
.view-block.lateral { grid-column: 2 / 3; grid-row: 1 / 2; }
.view-block.superior { grid-column: 1 / 3; grid-row: 2 / 3; }

.view-title { font-size: 0.75rem; color: #1e293b; text-transform: uppercase; font-weight: 700; margin-bottom: 5px; align-self: flex-start; background: rgba(255,255,255,0.8); padding: 4px 10px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.canvas-container { flex: 1; position: relative; background: white; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border: 1px solid #94a3b8; box-sizing: border-box; min-height: 0; min-width: 0; }
canvas { display: block; background-color: white; width: 100%; height: 100%; object-fit: contain;} /* Mantém a proporção lógica dentro do grid sem distorcer! */

/* PAINEL LATERAL */
.side-panel { height: 100%; min-height: 0; display: flex; flex-direction: column; gap: 15px; overflow-y: auto; padding-right: 5px;}
.properties-card { flex-shrink: 0; } 
.accessories-card { flex-shrink: 0; border-top: 3px solid #f37021;}
.price-card { flex-shrink: 0; background-color: #f8fafc; border: 1px solid #cbd5e1; margin-bottom: 10px;}

.tabs-navigation.accessories-tabs { display: flex; flex-wrap: wrap; gap: 2px; padding: 10px 10px 0 10px; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; }
.erp-tab.mini { padding: 8px 12px; font-size: 0.75rem; color: #475569; border: 1px solid transparent; background: transparent; cursor: pointer; font-weight: 600; border-radius: 4px 4px 0 0;}
.erp-tab.mini.active { color: #f37021; background: white; border-color: #e2e8f0; border-bottom-color: white; margin-bottom: -1px;}

.property-form { display: flex; flex-direction: column; gap: 10px; padding: 15px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.form-group { display: flex; flex-direction: column; gap: 3px; }
.form-group label { font-size: 0.7rem; font-weight: 600; color: #64748b; text-transform: uppercase;}
.erp-input { padding: 6px 8px; border: 1px solid #ced4da; border-radius: 4px; font-size: 0.85rem; }
.erp-input:focus { outline: none; border-color: #f37021; }
.bg-readonly { background-color: #f1f5f9; color: #334155; font-weight: bold; border-color: #cbd5e1; }
.full-width { grid-column: span 2; }

.btn-secondary { background-color: #f8f9fa; color: #333; border: 1px solid #ced4da; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 0.8rem; }
.btn-success { background-color: #15803d; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-weight: 700; cursor: pointer; font-size: 0.8rem; }

.scale-badge { background: #e2e8f0; color: #475569; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600; margin-left: 5px; }
.switch-container { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: bold; color: #15803d; cursor: pointer; background: #f0fdf4; padding: 8px; border-radius: 4px; border: 1px solid #bbf7d0;}
.disabled-section { opacity: 0.4; pointer-events: none; }
.mb-10 { margin-bottom: 10px; }

.price-grid { display: grid; grid-template-columns: 1fr auto; gap: 6px; font-size: 0.85rem; color: #334155; padding: 15px; }
.total-row { border-top: 2px solid #cbd5e1; padding-top: 8px; margin-top: 5px; font-size: 1rem; color: #0f172a; }

@media (max-width: 1024px) { 
  .erp-container { height: auto; overflow-y: visible; }
  .main-grid { grid-template-columns: 1fr; display: flex; flex-direction: column; } 
  .canvas-section { height: 1000px; flex-shrink: 0; }
  .views-wrapper { display: flex; flex-direction: column;}
  .view-block { height: 300px; }
  .side-panel { height: auto; overflow-y: visible;} 
}
</style>