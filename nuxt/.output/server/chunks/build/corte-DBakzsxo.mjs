import { defineComponent, ref, mergeProps, computed, watch, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderStyle, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { useRouter } from 'vue-router';
import { _ as _export_sfc } from './server.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';

const MAX_DISPLAY_DIM = 1e3;
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Corte",
  __ssrInlineRender: true,
  props: {
    materiaisIniciais: {},
    opsIniciais: {}
  },
  setup(__props) {
    const props = __props;
    const canvasRef = ref(null);
    ref(null);
    const materiais = ref([]);
    const rectangles = ref([]);
    const currentRollIndex = ref(0);
    const selectedIndex = ref(-1);
    const editValues = ref({ x: 0, y: 0, width: 0, height: 0, color: "", roloId: 0, op: "" });
    const scrollTop = ref(0);
    const isAtBottom = ref(false);
    const currentRoll = computed(() => materiais.value[currentRollIndex.value]);
    const scaleFactor = computed(() => {
      if (!currentRoll.value) return 1;
      const maxDim = Math.max(currentRoll.value.largura, currentRoll.value.comprimento);
      return maxDim > MAX_DISPLAY_DIM ? MAX_DISPLAY_DIM / maxDim : 1;
    });
    const displaySize = computed(() => ({
      width: currentRoll.value ? currentRoll.value.largura * scaleFactor.value : 800,
      height: currentRoll.value ? currentRoll.value.comprimento * scaleFactor.value : 1e3
    }));
    function initCanvas() {
      if (canvasRef.value && currentRoll.value) {
        canvasRef.value.width = displaySize.value.width;
        canvasRef.value.height = displaySize.value.height;
        draw();
      }
    }
    watch(currentRollIndex, () => {
      selectedIndex.value = -1;
      initCanvas();
    });
    watch([rectangles, materiais, () => props.materiaisIniciais, () => props.opsIniciais], () => {
      if (canvasRef.value) {
        if (canvasRef.value.width === 0) initCanvas();
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
      const ctx = canvasRef.value.getContext("2d");
      if (!ctx) return;
      const s = scaleFactor.value;
      ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 1;
      for (let i = 0; i < currentRoll.value.comprimento; i += 100) {
        ctx.beginPath();
        ctx.moveTo(0, i * s);
        ctx.lineTo(canvasRef.value.width, i * s);
        ctx.stroke();
      }
      rectangles.value.forEach((rect, index) => {
        if (rect.roloId !== currentRollIndex.value) return;
        const dx = rect.x * s;
        const dy = rect.y * s;
        const dw = rect.width * s;
        const dh = rect.height * s;
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
            ctx.moveTo(dx + i, dy);
            ctx.lineTo(dx + i + dh, dy + dh);
          }
          ctx.stroke();
          ctx.restore();
        } else {
          ctx.fillStyle = rect.color;
          ctx.globalAlpha = 0.8;
          ctx.fillRect(dx, dy, dw, dh);
          ctx.globalAlpha = 1;
        }
        const isSelected = selectedIndex.value === index;
        ctx.strokeStyle = isSelected ? "#f37021" : rect.fixed ? "#94a3b8" : "#1f2937";
        ctx.lineWidth = isSelected ? 3 : 1;
        ctx.strokeRect(dx, dy, dw, dh);
        ctx.fillStyle = rect.fixed ? "#64748b" : isSelected ? "#000" : "#fff";
        ctx.font = `bold ${Math.max(10, 12 * s)}px sans-serif`;
        ctx.fillText(`OP ${rect.op}${rect.fixed ? " (FIXO)" : ""}`, dx + 5, dy + 18 * s);
      });
    }
    const podeRotacionar = computed(() => {
      if (selectedIndex.value === -1) return false;
      const r = rectangles.value[selectedIndex.value];
      if (r.fixed) return false;
      return r.height <= currentRoll.value.largura && r.width <= currentRoll.value.comprimento;
    });
    useRouter();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "erp-container" }, _attrs))} data-v-f696624c><div class="erp-content" data-v-f696624c><div class="tabs-section" data-v-f696624c><div class="tabs-navigation" data-v-f696624c><!--[-->`);
      ssrRenderList(materiais.value, (rolo, index) => {
        _push(`<button class="${ssrRenderClass([{ active: currentRollIndex.value === index }, "erp-tab"])}" data-v-f696624c>${ssrInterpolate(rolo.nome || "ROLO " + (index + 1))} (${ssrInterpolate(rolo.largura)}x${ssrInterpolate(rolo.comprimento)}) </button>`);
      });
      _push(`<!--]--></div><div class="tabs-actions" data-v-f696624c><button class="btn-secondary" style="${ssrRenderStyle({ "margin-right": "10px" })}" data-v-f696624c>REDESENHAR</button><button class="btn-primary" data-v-f696624c>ADICIONAR CORTE</button><button class="btn-success" style="${ssrRenderStyle({ "margin-left": "10px" })}" data-v-f696624c>IR PARA REALIZAÇÃO</button></div></div><div class="main-grid" data-v-f696624c><section class="canvas-section card" data-v-f696624c><div class="card-header" data-v-f696624c><h2 class="card-title" data-v-f696624c>Visualização do Rolo</h2><div class="card-tools" data-v-f696624c><span class="scale-badge" data-v-f696624c>Escala: ${ssrInterpolate((scaleFactor.value * 100).toFixed(1))}%</span><span class="icon-tool" data-v-f696624c>✏️</span><span class="icon-tool" data-v-f696624c>📎</span></div></div><div class="canvas-viewport" data-v-f696624c><div class="canvas-container" style="${ssrRenderStyle({
        width: displaySize.value.width + 2 + "px",
        height: displaySize.value.height + "px"
      })}" data-v-f696624c>`);
      if (scrollTop.value > 5) {
        _push(`<div class="wavy-edge top" data-v-f696624c></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<canvas data-v-f696624c></canvas>`);
      if (!isAtBottom.value) {
        _push(`<div class="wavy-edge bottom" data-v-f696624c></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></section><aside class="side-panel" data-v-f696624c><div class="card properties-card" data-v-f696624c><div class="card-header" data-v-f696624c><h2 class="card-title" data-v-f696624c>Propriedades do Corte</h2></div><div class="card-body" data-v-f696624c>`);
      if (selectedIndex.value !== -1) {
        _push(`<div class="property-form" data-v-f696624c><div class="${ssrRenderClass([{ "fixed-badge": rectangles.value[selectedIndex.value]?.fixed }, "op-badge"])}" data-v-f696624c> OP #${ssrInterpolate(rectangles.value[selectedIndex.value]?.op)} `);
        if (rectangles.value[selectedIndex.value]?.fixed) {
          _push(`<span data-v-f696624c> (FIXO)</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="form-grid" data-v-f696624c><div class="form-group full-width" data-v-f696624c><label data-v-f696624c>Ordem de Produção (OP)</label><select class="erp-input"${ssrIncludeBooleanAttr(rectangles.value[selectedIndex.value]?.fixed) ? " disabled" : ""} data-v-f696624c><option${ssrRenderAttr("value", -1)} data-v-f696624c${ssrIncludeBooleanAttr(Array.isArray(editValues.value.op) ? ssrLooseContain(editValues.value.op, -1) : ssrLooseEqual(editValues.value.op, -1)) ? " selected" : ""}>DESCARTE (OP -1)</option><option${ssrRenderAttr("value", 0)} data-v-f696624c${ssrIncludeBooleanAttr(Array.isArray(editValues.value.op) ? ssrLooseContain(editValues.value.op, 0) : ssrLooseEqual(editValues.value.op, 0)) ? " selected" : ""}>ROLO FILHO (OP 0)</option><!--[-->`);
        ssrRenderList(__props.opsIniciais, (op) => {
          _push(`<option${ssrRenderAttr("value", op.id)} data-v-f696624c${ssrIncludeBooleanAttr(Array.isArray(editValues.value.op) ? ssrLooseContain(editValues.value.op, op.id) : ssrLooseEqual(editValues.value.op, op.id)) ? " selected" : ""}>OP #${ssrInterpolate(op.id)} - ${ssrInterpolate(op.cliente)}</option>`);
        });
        _push(`<!--]--><option value="MANUAL" data-v-f696624c${ssrIncludeBooleanAttr(Array.isArray(editValues.value.op) ? ssrLooseContain(editValues.value.op, "MANUAL") : ssrLooseEqual(editValues.value.op, "MANUAL")) ? " selected" : ""}>MANUAL</option></select></div><div class="form-group" data-v-f696624c><label data-v-f696624c>X (mm)</label><input type="number"${ssrRenderAttr("value", editValues.value.x)} class="erp-input"${ssrIncludeBooleanAttr(rectangles.value[selectedIndex.value]?.fixed) ? " disabled" : ""} data-v-f696624c></div><div class="form-group" data-v-f696624c><label data-v-f696624c>Y (mm)</label><input type="number"${ssrRenderAttr("value", editValues.value.y)} class="erp-input"${ssrIncludeBooleanAttr(rectangles.value[selectedIndex.value]?.fixed) ? " disabled" : ""} data-v-f696624c></div><div class="form-group" data-v-f696624c><label data-v-f696624c>Largura</label><input type="number"${ssrRenderAttr("value", editValues.value.width)} class="erp-input"${ssrIncludeBooleanAttr(rectangles.value[selectedIndex.value]?.fixed) ? " disabled" : ""} data-v-f696624c></div><div class="form-group" data-v-f696624c><label data-v-f696624c>Altura</label><input type="number"${ssrRenderAttr("value", editValues.value.height)} class="erp-input"${ssrIncludeBooleanAttr(rectangles.value[selectedIndex.value]?.fixed) ? " disabled" : ""} data-v-f696624c></div><div class="form-group full-width" data-v-f696624c><label data-v-f696624c>Transferir para Rolo</label><select class="erp-input"${ssrIncludeBooleanAttr(rectangles.value[selectedIndex.value]?.fixed) ? " disabled" : ""} data-v-f696624c><!--[-->`);
        ssrRenderList(materiais.value, (rolo, idx) => {
          _push(`<option${ssrRenderAttr("value", idx)} data-v-f696624c${ssrIncludeBooleanAttr(Array.isArray(editValues.value.roloId) ? ssrLooseContain(editValues.value.roloId, idx) : ssrLooseEqual(editValues.value.roloId, idx)) ? " selected" : ""}>${ssrInterpolate(rolo.nome || "ROLO " + (idx + 1))} (${ssrInterpolate(rolo.largura)}x${ssrInterpolate(rolo.comprimento)}) </option>`);
        });
        _push(`<!--]--></select></div></div>`);
        if (!rectangles.value[selectedIndex.value]?.fixed) {
          _push(`<div class="form-actions" data-v-f696624c><button class="btn-secondary"${ssrIncludeBooleanAttr(!podeRotacionar.value) ? " disabled" : ""} data-v-f696624c>ROTACIONAR 🔄</button></div>`);
        } else {
          _push(`<!---->`);
        }
        if (!rectangles.value[selectedIndex.value]?.fixed) {
          _push(`<div class="form-actions" data-v-f696624c><button class="btn-danger" data-v-f696624c>EXCLUIR</button><button class="btn-secondary" data-v-f696624c>FECHAR</button></div>`);
        } else {
          _push(`<div class="fixed-notice" data-v-f696624c> Este corte já existe no rolo e não pode ser alterado. </div>`);
        }
        _push(`</div>`);
      } else {
        _push(`<div class="empty-state" data-v-f696624c><p data-v-f696624c>Selecione um corte no visualizador para editar suas propriedades.</p></div>`);
      }
      _push(`</div></div><div class="card list-card" data-v-f696624c><div class="card-header" data-v-f696624c><h2 class="card-title" data-v-f696624c>Cortes no Rolo Atual</h2><span class="count-badge" data-v-f696624c>${ssrInterpolate(rectangles.value.filter((r) => r.roloId === currentRollIndex.value).length)}</span></div><div class="card-body no-padding" data-v-f696624c><div class="table-container" data-v-f696624c><table class="erp-table" data-v-f696624c><thead data-v-f696624c><tr data-v-f696624c><th data-v-f696624c>OP</th><th data-v-f696624c>Rolo</th><th data-v-f696624c>Dimensões</th><th data-v-f696624c>Status</th><th data-v-f696624c>Ações</th></tr></thead><tbody data-v-f696624c><!--[-->`);
      ssrRenderList(rectangles.value, (rect, index) => {
        _push(`<tr class="${ssrRenderClass({
          selected: selectedIndex.value === index,
          "is-fixed": rect.fixed,
          "other-roll": rect.roloId !== currentRollIndex.value
        })}" data-v-f696624c><td data-v-f696624c><strong data-v-f696624c>${ssrInterpolate(rect.op)}</strong></td><td data-v-f696624c><span class="roll-mini-tag" data-v-f696624c>${ssrInterpolate(materiais.value[rect.roloId]?.nome || "R" + (rect.roloId + 1))}</span></td><td data-v-f696624c>${ssrInterpolate(rect.width)} x ${ssrInterpolate(rect.height)}</td><td data-v-f696624c>`);
        if (rect.fixed) {
          _push(`<span class="status-tag fixed" data-v-f696624c>Fixo</span>`);
        } else {
          _push(`<span class="status-tag new" data-v-f696624c>Novo</span>`);
        }
        _push(`</td><td data-v-f696624c>`);
        if (!rect.fixed) {
          _push(`<button class="icon-btn delete" data-v-f696624c>🗑️</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</td></tr>`);
      });
      _push(`<!--]--></tbody></table></div></div></div></aside></div></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Corte.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-f696624c"]]), { __name: "Corte" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "corte",
  __ssrInlineRender: true,
  setup(__props) {
    const materiais = ref([]);
    const ops = ref([]);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Corte = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "app-wrapper" }, _attrs))} data-v-b762f861>`);
      _push(ssrRenderComponent(_component_Corte, {
        "materiais-iniciais": materiais.value,
        "ops-iniciais": ops.value
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/corte.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const corte = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b762f861"]]);

export { corte as default };
//# sourceMappingURL=corte-DBakzsxo.mjs.map
