import { defineComponent, ref, mergeProps, watch, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Corte",
  __ssrInlineRender: true,
  props: {
    dadosCortes: {}
  },
  setup(__props) {
    ref(null);
    const rectangles = ref([]);
    const selectedIndex = ref(-1);
    const editValues = ref({ x: 0, y: 0, width: 0, height: 0, color: "#3b82f6", op: 0 });
    watch(selectedIndex, (newIndex) => {
      if (newIndex !== -1 && rectangles.value[newIndex]) {
        editValues.value = { ...rectangles.value[newIndex] };
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[--><div class="app-container"><h1>Painel de Cortes (Canvas)</h1><div class="controls"><button>Adicionar Retângulo</button></div><canvas></canvas></div><div class="side-panel"><h2>Propriedades</h2>`);
      if (selectedIndex.value !== -1) {
        _push(`<div class="properties"><div class="property-group"><label>OP Selecionada: ${ssrInterpolate(rectangles.value[selectedIndex.value]?.op)}</label></div><div class="property-group"><label for="pos-x">Posição X (x0):</label><input id="pos-x" type="number"${ssrRenderAttr("value", editValues.value.x)}></div><div class="property-group"><label for="pos-y">Posição Y (y0):</label><input id="pos-y" type="number"${ssrRenderAttr("value", editValues.value.y)}></div><div class="property-group"><label for="width">Largura (Δx):</label><input id="width" type="number"${ssrRenderAttr("value", editValues.value.width)}></div><div class="property-group"><label for="height">Altura (Δy):</label><input id="height" type="number"${ssrRenderAttr("value", editValues.value.height)}></div><div class="action-buttons"><button class="delete-btn">Excluir</button><button class="deselect-btn">Desselecionar</button></div></div>`);
      } else {
        _push(`<div class="no-selection"><p>Nenhum item selecionado</p><small>Clique em um retângulo no canvas</small></div>`);
      }
      _push(`<div class="rectangles-list"><h3>Lista de Cortes</h3><div class="list-items"><!--[-->`);
      ssrRenderList(rectangles.value, (rect, index) => {
        _push(`<div class="${ssrRenderClass([{ active: selectedIndex.value === index }, "list-item"])}"><span class="item-info"> OP #${ssrInterpolate(rect.op)} <small>Pos: ${ssrInterpolate(rect.x)}, ${ssrInterpolate(rect.y)}</small></span></div>`);
      });
      _push(`<!--]--></div></div></div><!--]-->`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Corte.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main$1, { __name: "Corte" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "corte",
  __ssrInlineRender: true,
  setup(__props) {
    const listaDeCortes = ref([
      { x0: 50, x1: 150, y0: 50, y1: 130, op: 2134 },
      { x0: 200, x1: 320, y0: 150, y1: 240, op: 543 },
      { x0: 400, x1: 480, y0: 100, y1: 200, op: 2033 }
    ]);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Corte = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "app-wrapper" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_Corte, { "dados-cortes": listaDeCortes.value }, null, _parent));
      _push(`<div class="navigation-hint" style="${ssrRenderStyle({ "position": "absolute", "bottom": "10px", "left": "10px" })}"><p>Rota atual: /corte</p></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/corte.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=corte-sw7RwSAB.mjs.map
