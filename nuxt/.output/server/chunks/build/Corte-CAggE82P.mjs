import { defineComponent, ref, computed, watch, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderStyle, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { useRouter } from 'vue-router';
import { _ as _export_sfc } from './server.mjs';

const MAX_CANVAS_DIMENSION = 32e3;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Corte",
  __ssrInlineRender: true,
  props: {
    materiaisIniciais: {},
    opsIniciais: {}
  },
  setup(__props, { expose: __expose }) {
    const props = __props;
    __expose({
      getPlanoProcessado: () => {
        const contadoresPorOP = {};
        return {
          pecas: rectangles.value.filter((r) => !r.fixed).map((r) => {
            const materialOrigem = materiais.value[r.roloId];
            if (!contadoresPorOP[r.op]) contadoresPorOP[r.op] = 0;
            contadoresPorOP[r.op]++;
            return {
              // DADOS DA MATÉRIA PRIMA (ORIGEM)
              cod_rolo: materialOrigem.cod_rolo || materialOrigem.id,
              // ID único do saldo
              cod_lote_origem: materialOrigem.cod_lote,
              cod_embalagem_origem: materialOrigem.cod_embalagem,
              // <--- VALOR DO eq_saldo (ex: 2)
              // DADOS DA PEÇA SENDO GERADA (DESTINO)
              cod_op: r.op === "MANUAL" ? 0 : r.op,
              cod_lote: r.op,
              // O lote da peça nova é o número da OP
              cod_embalagem: contadoresPorOP[r.op],
              // Sequencial da peça (1, 2, 3...)
              // MEDIDAS E COORDENADAS
              largura: Math.round(r.width),
              comprimento: Math.round(r.height),
              m2: parseFloat((r.width * r.height / 1e6).toFixed(6)),
              x0: Math.round(r.x),
              x1: Math.round(r.x + r.width),
              y0: Math.round(r.y),
              y1: Math.round(r.y + r.height),
              nr_serie: r.op === 0 ? "CORTE" : r.op === -1 ? "SUCATA" : "PECA"
            };
          })
        };
      }
    });
    const canvasRef = ref(null);
    ref(null);
    const materiais = ref([]);
    const rectangles = ref([]);
    const currentRollIndex = ref(0);
    const selectedIndex = ref(-1);
    const editValues = ref({ x: 0, y: 0, width: 0, height: 0, color: "", roloId: 0, op: "" });
    const scrollTop = ref(0);
    const isAtBottom = ref(false);
    const containerWidth = ref(0);
    const currentRoll = computed(() => materiais.value[currentRollIndex.value]);
    const cssScale = computed(() => {
      if (!currentRoll.value || !containerWidth.value) return 1;
      const largura = Number(currentRoll.value.largura);
      if (!largura || isNaN(largura) || largura <= 0) return 1;
      const scale = containerWidth.value / largura;
      return isNaN(scale) || scale <= 0 ? 1 : scale;
    });
    const displaySize = computed(() => {
      let w = 800;
      let h = 1e3;
      if (currentRoll.value) {
        w = Number(currentRoll.value.largura) * cssScale.value;
        h = Number(currentRoll.value.comprimento) * cssScale.value;
      } else if (containerWidth.value) {
        w = containerWidth.value;
      }
      return {
        width: isNaN(w) || w < 1 ? 1 : Math.round(w),
        height: isNaN(h) || h < 1 ? 1 : Math.round(h)
      };
    });
    const physicalSize = computed(() => {
      if (!currentRoll.value) return { width: displaySize.value.width, height: displaySize.value.height, renderScale: cssScale.value };
      const dpr = 1;
      let w = displaySize.value.width * dpr;
      let h = displaySize.value.height * dpr;
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
      const rScale = w / Number(currentRoll.value.largura);
      return {
        width: Math.max(1, Math.floor(w)),
        height: Math.max(1, Math.floor(h)),
        renderScale: isNaN(rScale) || rScale <= 0 ? 1 : rScale
      };
    });
    function initCanvas() {
      if (canvasRef.value && currentRoll.value) {
        canvasRef.value.width = physicalSize.value.width;
        canvasRef.value.height = physicalSize.value.height;
        canvasRef.value.style.width = displaySize.value.width + "px";
        canvasRef.value.style.height = displaySize.value.height + "px";
        draw();
      }
    }
    watch(displaySize, () => {
      initCanvas();
    });
    watch(currentRollIndex, () => {
      selectedIndex.value = -1;
      initCanvas();
    });
    watch([rectangles, materiais, () => props.materiaisIniciais, () => props.opsIniciais], () => {
      if (canvasRef.value) {
        if (!canvasRef.value.width || canvasRef.value.width < 1) initCanvas();
        draw();
      }
    }, { deep: true });
    watch(selectedIndex, (newIndex) => {
      if (newIndex !== -1 && rectangles.value[newIndex]) {
        editValues.value = { ...rectangles.value[newIndex] };
      }
    });
    function draw() {
      if (!canvasRef.value || !currentRoll.value) return;
      const w = canvasRef.value.width;
      const h = canvasRef.value.height;
      if (!w || !h || !Number.isFinite(w) || !Number.isFinite(h) || w < 1 || h < 1) return;
      const ctx = canvasRef.value.getContext("2d");
      if (!ctx) return;
      let s = Number(physicalSize.value.renderScale);
      if (!Number.isFinite(s) || s <= 0) s = 1;
      try {
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 1;
        for (let i = 0; i < currentRoll.value.comprimento; i += 100) {
          const yPos = i * s;
          if (!Number.isFinite(yPos)) continue;
          ctx.beginPath();
          ctx.moveTo(0, yPos);
          ctx.lineTo(w, yPos);
          ctx.stroke();
        }
        rectangles.value.forEach((rect, index) => {
          if (!rect || rect.roloId !== currentRollIndex.value) return;
          const rX = Number(rect.x) || 0;
          const rY = Number(rect.y) || 0;
          const rW = Number(rect.width) || 0;
          const rH = Number(rect.height) || 0;
          const dx = rX * s;
          const dy = rY * s;
          const dw = rW * s;
          const dh = rH * s;
          if (!Number.isFinite(dx) || !Number.isFinite(dy) || !Number.isFinite(dw) || !Number.isFinite(dh)) return;
          if (rect.fixed) {
            ctx.save();
            ctx.fillStyle = "#e2e8f0";
            ctx.fillRect(dx, dy, dw, dh);
            ctx.beginPath();
            ctx.rect(dx, dy, dw, dh);
            ctx.clip();
            ctx.strokeStyle = "#94a3b8";
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = -dh; i < dw + dh; i += 10) {
              if (!Number.isFinite(i)) continue;
              ctx.moveTo(dx + i, dy);
              ctx.lineTo(dx + i + dh, dy + dh);
            }
            ctx.stroke();
            ctx.restore();
          } else {
            ctx.fillStyle = rect.color || "#3b82f6";
            ctx.globalAlpha = 0.8;
            ctx.fillRect(dx, dy, dw, dh);
            ctx.globalAlpha = 1;
          }
          const isSelected = selectedIndex.value === index;
          ctx.strokeStyle = isSelected ? "#f37021" : rect.fixed ? "#94a3b8" : "#1f2937";
          ctx.lineWidth = isSelected ? 3 : 1;
          ctx.strokeRect(dx, dy, dw, dh);
          ctx.fillStyle = rect.fixed ? "#64748b" : isSelected ? "#000" : "#fff";
          let fontSize = 14 * s;
          if (!Number.isFinite(fontSize) || fontSize <= 0) fontSize = 14;
          ctx.font = `bold ${Math.max(2, fontSize)}px sans-serif`;
          const textY = dy + 18 * s;
          if (Number.isFinite(dx) && Number.isFinite(textY)) {
            ctx.fillText(`OP ${rect.op}${rect.fixed ? " (FIXO)" : ""}`, dx + 5 * s, textY);
          }
        });
      } catch (error) {
        console.warn("Corte.vue: Rendering interrompido temporariamente para prevenir Exception:", error);
      }
    }
    const podeRotacionar = computed(() => {
      if (selectedIndex.value === -1 || !currentRoll.value) return false;
      const r = rectangles.value[selectedIndex.value];
      if (!r || r.fixed) return false;
      const rWidth = Number(r.width) || 0;
      const rHeight = Number(r.height) || 0;
      const currLarg = Number(currentRoll.value.largura) || 0;
      const currComp = Number(currentRoll.value.comprimento) || 0;
      return rHeight <= currLarg && rWidth <= currComp;
    });
    useRouter();
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "erp-container" }, _attrs))} data-v-0aea7e09><div class="erp-content" data-v-0aea7e09><div class="tabs-section" data-v-0aea7e09><div class="tabs-navigation" data-v-0aea7e09><!--[-->`);
      ssrRenderList(materiais.value, (rolo, index) => {
        _push(`<button class="${ssrRenderClass([{ active: currentRollIndex.value === index }, "erp-tab"])}" data-v-0aea7e09>${ssrInterpolate(rolo.nome || "ROLO " + (index + 1))} (${ssrInterpolate(rolo.largura)}x${ssrInterpolate(rolo.comprimento)}) </button>`);
      });
      _push(`<!--]--></div><div class="tabs-actions" data-v-0aea7e09><button class="btn-secondary" style="${ssrRenderStyle({ "margin-right": "10px" })}" data-v-0aea7e09>REDESENHAR</button><button class="btn-primary" data-v-0aea7e09>ADICIONAR CORTE</button></div></div><div class="main-grid" data-v-0aea7e09><section class="canvas-section card" data-v-0aea7e09><div class="card-header" data-v-0aea7e09><h2 class="card-title" data-v-0aea7e09>Visualiza\xE7\xE3o do Rolo</h2><div class="card-tools" data-v-0aea7e09><span class="scale-badge" data-v-0aea7e09>Escala: ${ssrInterpolate((cssScale.value * 100).toFixed(1))}%</span><span class="icon-tool" data-v-0aea7e09>\u270F\uFE0F</span><span class="icon-tool" data-v-0aea7e09>\u{1F4CE}</span></div></div><div class="canvas-viewport" data-v-0aea7e09><div class="canvas-container" style="${ssrRenderStyle({
        width: displaySize.value.width + "px",
        height: displaySize.value.height + "px"
      })}" data-v-0aea7e09>`);
      if (scrollTop.value > 5) {
        _push(`<div class="wavy-edge top" data-v-0aea7e09></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<canvas data-v-0aea7e09></canvas>`);
      if (!isAtBottom.value) {
        _push(`<div class="wavy-edge bottom" data-v-0aea7e09></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></section><aside class="side-panel" data-v-0aea7e09><div class="card properties-card" data-v-0aea7e09><div class="card-header" data-v-0aea7e09><h2 class="card-title" data-v-0aea7e09>Propriedades do Corte</h2></div><div class="card-body" data-v-0aea7e09>`);
      if (selectedIndex.value !== -1) {
        _push(`<div class="property-form" data-v-0aea7e09><div class="${ssrRenderClass([{ "fixed-badge": (_a = rectangles.value[selectedIndex.value]) == null ? void 0 : _a.fixed }, "op-badge"])}" data-v-0aea7e09> OP #${ssrInterpolate((_b = rectangles.value[selectedIndex.value]) == null ? void 0 : _b.op)} `);
        if ((_c = rectangles.value[selectedIndex.value]) == null ? void 0 : _c.fixed) {
          _push(`<span data-v-0aea7e09> (FIXO)</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="form-grid" data-v-0aea7e09><div class="form-group full-width" data-v-0aea7e09><label data-v-0aea7e09>Ordem de Produ\xE7\xE3o (OP)</label><select class="erp-input"${ssrIncludeBooleanAttr((_d = rectangles.value[selectedIndex.value]) == null ? void 0 : _d.fixed) ? " disabled" : ""} data-v-0aea7e09><option${ssrRenderAttr("value", -1)} data-v-0aea7e09${ssrIncludeBooleanAttr(Array.isArray(editValues.value.op) ? ssrLooseContain(editValues.value.op, -1) : ssrLooseEqual(editValues.value.op, -1)) ? " selected" : ""}>DESCARTE (OP -1)</option><option${ssrRenderAttr("value", 0)} data-v-0aea7e09${ssrIncludeBooleanAttr(Array.isArray(editValues.value.op) ? ssrLooseContain(editValues.value.op, 0) : ssrLooseEqual(editValues.value.op, 0)) ? " selected" : ""}>ROLO FILHO (OP 0)</option><!--[-->`);
        ssrRenderList(__props.opsIniciais, (op) => {
          _push(`<option${ssrRenderAttr("value", op.id)} data-v-0aea7e09${ssrIncludeBooleanAttr(Array.isArray(editValues.value.op) ? ssrLooseContain(editValues.value.op, op.id) : ssrLooseEqual(editValues.value.op, op.id)) ? " selected" : ""}>OP #${ssrInterpolate(op.id)} - ${ssrInterpolate(op.cliente)}</option>`);
        });
        _push(`<!--]--><option value="MANUAL" data-v-0aea7e09${ssrIncludeBooleanAttr(Array.isArray(editValues.value.op) ? ssrLooseContain(editValues.value.op, "MANUAL") : ssrLooseEqual(editValues.value.op, "MANUAL")) ? " selected" : ""}>MANUAL</option></select></div><div class="form-group" data-v-0aea7e09><label data-v-0aea7e09>X (mm)</label><input type="number"${ssrRenderAttr("value", editValues.value.x)} class="erp-input"${ssrIncludeBooleanAttr((_e = rectangles.value[selectedIndex.value]) == null ? void 0 : _e.fixed) ? " disabled" : ""} data-v-0aea7e09></div><div class="form-group" data-v-0aea7e09><label data-v-0aea7e09>Y (mm)</label><input type="number"${ssrRenderAttr("value", editValues.value.y)} class="erp-input"${ssrIncludeBooleanAttr((_f = rectangles.value[selectedIndex.value]) == null ? void 0 : _f.fixed) ? " disabled" : ""} data-v-0aea7e09></div><div class="form-group" data-v-0aea7e09><label data-v-0aea7e09>Largura</label><input type="number"${ssrRenderAttr("value", editValues.value.width)} class="erp-input"${ssrIncludeBooleanAttr((_g = rectangles.value[selectedIndex.value]) == null ? void 0 : _g.fixed) ? " disabled" : ""} data-v-0aea7e09></div><div class="form-group" data-v-0aea7e09><label data-v-0aea7e09>Altura</label><input type="number"${ssrRenderAttr("value", editValues.value.height)} class="erp-input"${ssrIncludeBooleanAttr((_h = rectangles.value[selectedIndex.value]) == null ? void 0 : _h.fixed) ? " disabled" : ""} data-v-0aea7e09></div><div class="form-group full-width" data-v-0aea7e09><label data-v-0aea7e09>Transferir para Rolo</label><select class="erp-input"${ssrIncludeBooleanAttr((_i = rectangles.value[selectedIndex.value]) == null ? void 0 : _i.fixed) ? " disabled" : ""} data-v-0aea7e09><!--[-->`);
        ssrRenderList(materiais.value, (rolo, idx) => {
          _push(`<option${ssrRenderAttr("value", idx)} data-v-0aea7e09${ssrIncludeBooleanAttr(Array.isArray(editValues.value.roloId) ? ssrLooseContain(editValues.value.roloId, idx) : ssrLooseEqual(editValues.value.roloId, idx)) ? " selected" : ""}>${ssrInterpolate(rolo.nome || "ROLO " + (idx + 1))} (${ssrInterpolate(rolo.largura)}x${ssrInterpolate(rolo.comprimento)}) </option>`);
        });
        _push(`<!--]--></select></div></div>`);
        if (!((_j = rectangles.value[selectedIndex.value]) == null ? void 0 : _j.fixed)) {
          _push(`<div class="form-actions" data-v-0aea7e09><button class="btn-secondary"${ssrIncludeBooleanAttr(!podeRotacionar.value) ? " disabled" : ""} data-v-0aea7e09>ROTACIONAR \u{1F504}</button></div>`);
        } else {
          _push(`<!---->`);
        }
        if (!((_k = rectangles.value[selectedIndex.value]) == null ? void 0 : _k.fixed)) {
          _push(`<div class="form-actions" data-v-0aea7e09><button class="btn-danger" data-v-0aea7e09>EXCLUIR</button><button class="btn-secondary" data-v-0aea7e09>FECHAR</button></div>`);
        } else {
          _push(`<div class="fixed-notice" data-v-0aea7e09> Este corte j\xE1 existe no rolo e n\xE3o pode ser alterado. </div>`);
        }
        _push(`</div>`);
      } else {
        _push(`<div class="empty-state" data-v-0aea7e09><p data-v-0aea7e09>Selecione um corte no visualizador para editar suas propriedades.</p></div>`);
      }
      _push(`</div></div><div class="card list-card" data-v-0aea7e09><div class="card-header" data-v-0aea7e09><h2 class="card-title" data-v-0aea7e09>Cortes no Rolo Atual</h2><span class="count-badge" data-v-0aea7e09>${ssrInterpolate(rectangles.value.filter((r) => r.roloId === currentRollIndex.value).length)}</span></div><div class="card-body no-padding" data-v-0aea7e09><div class="table-container" data-v-0aea7e09><table class="erp-table" data-v-0aea7e09><thead data-v-0aea7e09><tr data-v-0aea7e09><th data-v-0aea7e09>OP</th><th data-v-0aea7e09>Rolo</th><th data-v-0aea7e09>Dimens\xF5es</th><th data-v-0aea7e09>Status</th><th data-v-0aea7e09>A\xE7\xF5es</th></tr></thead><tbody data-v-0aea7e09><!--[-->`);
      ssrRenderList(rectangles.value, (rect, index) => {
        var _a2;
        _push(`<tr class="${ssrRenderClass({
          selected: selectedIndex.value === index,
          "is-fixed": rect.fixed,
          "other-roll": rect.roloId !== currentRollIndex.value
        })}" data-v-0aea7e09><td data-v-0aea7e09><strong data-v-0aea7e09>${ssrInterpolate(rect.op)}</strong></td><td data-v-0aea7e09><span class="roll-mini-tag" data-v-0aea7e09>${ssrInterpolate(((_a2 = materiais.value[rect.roloId]) == null ? void 0 : _a2.nome) || "R" + (rect.roloId + 1))}</span></td><td data-v-0aea7e09>${ssrInterpolate(rect.width)} x ${ssrInterpolate(rect.height)}</td><td data-v-0aea7e09>`);
        if (rect.fixed) {
          _push(`<span class="status-tag fixed" data-v-0aea7e09>Fixo</span>`);
        } else {
          _push(`<span class="status-tag new" data-v-0aea7e09>Novo</span>`);
        }
        _push(`</td><td data-v-0aea7e09>`);
        if (!rect.fixed) {
          _push(`<button class="icon-btn delete" data-v-0aea7e09>\u{1F5D1}\uFE0F</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</td></tr>`);
      });
      _push(`<!--]--></tbody></table></div></div></div></aside></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Corte.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-0aea7e09"]]), { __name: "Corte" });

export { __nuxt_component_0 as _ };
//# sourceMappingURL=Corte-CAggE82P.mjs.map
