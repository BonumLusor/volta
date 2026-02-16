import { defineComponent, ref, mergeProps, computed, watch, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderStyle, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
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
import 'vue-router';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "RealizacaoCorte",
  __ssrInlineRender: true,
  props: {
    materiaisIniciais: {},
    cortesPlanejados: {}
  },
  setup(__props) {
    const props = __props;
    const canvasRef = ref(null);
    const materiais = ref(props.materiaisIniciais || []);
    const rectangles = ref([]);
    const currentRollIndex = ref(0);
    const selectedIndex = ref(-1);
    const editValues = ref({ x: 0, y: 0, width: 0, height: 0 });
    const currentRoll = computed(() => materiais.value[currentRollIndex.value]);
    const scaleFactor = computed(() => {
      if (!currentRoll.value) return 1;
      const maxDim = Math.max(currentRoll.value.largura, currentRoll.value.comprimento);
      return maxDim > 800 ? 800 / maxDim : 1;
    });
    const displaySize = computed(() => ({
      width: currentRoll.value ? currentRoll.value.largura * scaleFactor.value : 600,
      height: currentRoll.value ? currentRoll.value.comprimento * scaleFactor.value : 800
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
    watch(rectangles, () => draw(), { deep: true });
    function draw() {
      if (!canvasRef.value || !currentRoll.value) return;
      const ctx = canvasRef.value.getContext("2d");
      if (!ctx) return;
      const s = scaleFactor.value;
      ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
      rectangles.value.forEach((rect, index) => {
        if (rect.roloId !== currentRollIndex.value) return;
        const dx = rect.x * s, dy = rect.y * s, dw = rect.width * s, dh = rect.height * s;
        ctx.fillStyle = rect.fixed ? "#e2e8f0" : rect.color;
        ctx.globalAlpha = 0.6;
        ctx.fillRect(dx, dy, dw, dh);
        ctx.globalAlpha = 1;
        const isSelected = selectedIndex.value === index;
        ctx.strokeStyle = isSelected ? "#f37021" : "#333";
        ctx.lineWidth = isSelected ? 3 : 1;
        ctx.strokeRect(dx, dy, dw, dh);
        ctx.fillStyle = "#000";
        ctx.font = `bold ${12 * s}px sans-serif`;
        ctx.fillText(`${rect.op}`, dx + 5, dy + 15);
      });
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "erp-container" }, _attrs))} data-v-4316583e><div class="erp-content" data-v-4316583e><div class="tabs-section" data-v-4316583e><div class="tabs-navigation" data-v-4316583e><!--[-->`);
      ssrRenderList(materiais.value, (rolo, index) => {
        _push(`<button class="${ssrRenderClass([{ active: currentRollIndex.value === index }, "erp-tab"])}" data-v-4316583e>${ssrInterpolate(rolo.nome || "ROLO " + (index + 1))}</button>`);
      });
      _push(`<!--]--></div><div class="tabs-actions" data-v-4316583e><button class="btn-primary" data-v-4316583e>ADICIONAR CORREÇÃO</button><button class="btn-success" style="${ssrRenderStyle({ "margin-left": "10px" })}" data-v-4316583e>FINALIZAR</button></div></div><div class="main-grid" data-v-4316583e><section class="canvas-section card" data-v-4316583e><div class="card-header" data-v-4316583e><h2 class="card-title" data-v-4316583e>Execução Real: ${ssrInterpolate(materiais.value[currentRollIndex.value]?.nome)}</h2></div><div class="canvas-viewport" data-v-4316583e><div class="canvas-container" style="${ssrRenderStyle({ width: displaySize.value.width + "px", height: displaySize.value.height + "px" })}" data-v-4316583e><canvas data-v-4316583e></canvas></div></div></section><aside class="side-panel" data-v-4316583e><div class="card properties-card" data-v-4316583e><div class="card-header" data-v-4316583e><h2 class="card-title" data-v-4316583e>Ajuste de Medida Real</h2></div><div class="card-body" data-v-4316583e>`);
      if (selectedIndex.value !== -1) {
        _push(`<div class="property-form" data-v-4316583e><div class="${ssrRenderClass([{ "correction-badge": rectangles.value[selectedIndex.value]?.isCorrection }, "op-badge"])}" data-v-4316583e> OP #${ssrInterpolate(rectangles.value[selectedIndex.value]?.op)} `);
        if (rectangles.value[selectedIndex.value]?.isCorrection) {
          _push(`<span data-v-4316583e> (CORREÇÃO)</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="form-grid" data-v-4316583e><div class="form-group full-width" data-v-4316583e><label data-v-4316583e>Largura Real (mm)</label><input type="number"${ssrRenderAttr("value", editValues.value.width)} class="erp-input real-input" data-v-4316583e></div><div class="form-group full-width" data-v-4316583e><label data-v-4316583e>Altura Real (mm)</label><input type="number"${ssrRenderAttr("value", editValues.value.height)} class="erp-input real-input" data-v-4316583e></div><div class="form-group" data-v-4316583e><label data-v-4316583e>X (Posição)</label><input type="number"${ssrRenderAttr("value", editValues.value.x)} class="erp-input" data-v-4316583e></div><div class="form-group" data-v-4316583e><label data-v-4316583e>Y (Posição)</label><input type="number"${ssrRenderAttr("value", editValues.value.y)} class="erp-input" data-v-4316583e></div><div class="form-group full-width" data-v-4316583e><label data-v-4316583e>Transferir para Rolo</label><select class="erp-input" data-v-4316583e><!--[-->`);
        ssrRenderList(materiais.value, (rolo, idx) => {
          _push(`<option${ssrRenderAttr("value", idx)} data-v-4316583e${ssrIncludeBooleanAttr(Array.isArray(editValues.value.roloId) ? ssrLooseContain(editValues.value.roloId, idx) : ssrLooseEqual(editValues.value.roloId, idx)) ? " selected" : ""}>${ssrInterpolate(rolo.nome || "ROLO " + (idx + 1))}</option>`);
        });
        _push(`<!--]--></select></div></div><div class="form-actions" data-v-4316583e>`);
        if (rectangles.value[selectedIndex.value]?.isCorrection) {
          _push(`<button class="btn-danger" data-v-4316583e>REMOVER</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="btn-secondary" data-v-4316583e>FECHAR</button></div></div>`);
      } else {
        _push(`<div class="empty-state" data-v-4316583e><p data-v-4316583e>Selecione um corte para informar as medidas reais obtidas na máquina.</p></div>`);
      }
      _push(`</div></div><div class="card list-card" data-v-4316583e><div class="card-header" data-v-4316583e><h2 class="card-title" data-v-4316583e>Relatório de Cortes</h2></div><div class="card-body no-padding" data-v-4316583e><div class="table-container" data-v-4316583e><table class="erp-table" data-v-4316583e><thead data-v-4316583e><tr data-v-4316583e><th data-v-4316583e>OP</th><th data-v-4316583e>Planejado</th><th data-v-4316583e>Real</th></tr></thead><tbody data-v-4316583e><!--[-->`);
      ssrRenderList(rectangles.value, (rect, index) => {
        _push(`<tr class="${ssrRenderClass({ selected: selectedIndex.value === index, "is-correction": rect.isCorrection })}" style="${ssrRenderStyle(rect.roloId === currentRollIndex.value ? null : { display: "none" })}" data-v-4316583e><td data-v-4316583e><strong data-v-4316583e>${ssrInterpolate(rect.op)}</strong></td><td data-v-4316583e>${ssrInterpolate(rect.plannedWidth)}x${ssrInterpolate(rect.plannedHeight)}</td><td class="${ssrRenderClass({ "has-diff": rect.width !== rect.plannedWidth || rect.height !== rect.plannedHeight })}" data-v-4316583e>${ssrInterpolate(rect.width)}x${ssrInterpolate(rect.height)}</td></tr>`);
      });
      _push(`<!--]--></tbody></table></div></div></div></aside></div></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/RealizacaoCorte.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-4316583e"]]), { __name: "RealizacaoCorte" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "realizacao",
  __ssrInlineRender: true,
  setup(__props) {
    const materiais = ref([]);
    const cortes = ref([]);
    const dadosProntos = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_RealizacaoCorte = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "app-wrapper" }, _attrs))} data-v-174c2e95>`);
      if (dadosProntos.value) {
        _push(ssrRenderComponent(_component_RealizacaoCorte, {
          "materiais-iniciais": materiais.value,
          "cortes-planejados": cortes.value
        }, null, _parent));
      } else {
        _push(`<div class="loading-state" data-v-174c2e95> Carregando dados do planejamento... </div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/realizacao.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const realizacao = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-174c2e95"]]);

export { realizacao as default };
//# sourceMappingURL=realizacao-8o6wfBqf.mjs.map
