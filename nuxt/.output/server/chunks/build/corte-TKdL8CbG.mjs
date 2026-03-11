import { defineComponent, ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderComponent } from 'vue/server-renderer';
import { _ as __nuxt_component_0 } from './Corte-CAggE82P.mjs';
import { _ as _export_sfc } from './server.mjs';
import 'vue-router';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "corte",
  __ssrInlineRender: true,
  setup(__props) {
    const corteComponentRef = ref(null);
    const materiais = ref([]);
    const ops = ref([]);
    const produtoBase = ref(null);
    const dadosProntos = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "app-wrapper" }, _attrs))} data-v-8f3cbe5f><div class="erp-content-container" data-v-8f3cbe5f>`);
      if (dadosProntos.value) {
        _push(`<!--[--><div class="lote-config-bar" data-v-8f3cbe5f><div class="lote-info-header" data-v-8f3cbe5f><span class="lote-badge" data-v-8f3cbe5f>AJUSTE DE MAT\xC9RIA-PRIMA</span><h2 class="lote-title" data-v-8f3cbe5f>${ssrInterpolate(((_a = produtoBase.value) == null ? void 0 : _a.nome_produto) || "Material Selecionado")}</h2><button class="btn-salvar" data-v-8f3cbe5f>FINALIZAR E SALVAR</button></div><div class="lote-inputs-flex" data-v-8f3cbe5f><!--[-->`);
        ssrRenderList(materiais.value, (mat) => {
          _push(`<div class="input-item" data-v-8f3cbe5f><label data-v-8f3cbe5f>Lote: <strong data-v-8f3cbe5f>${ssrInterpolate(mat.nome)}</strong></label><div class="input-pair" data-v-8f3cbe5f><div class="field" data-v-8f3cbe5f><span class="field-label" data-v-8f3cbe5f>LARGURA (mm)</span><input type="number"${ssrRenderAttr("value", mat.largura)} title="Largura da chapa/bobina" data-v-8f3cbe5f></div><div class="field-separator" data-v-8f3cbe5f></div><div class="field" data-v-8f3cbe5f><span class="field-label" data-v-8f3cbe5f>COMPRIMENTO (mm)</span><input type="number"${ssrRenderAttr("value", mat.comprimento)} title="Comprimento da chapa/bobina" data-v-8f3cbe5f></div><area data-v-8f3cbe5f></div></div>`);
        });
        _push(`<!--]--></div></div>`);
        _push(ssrRenderComponent(__nuxt_component_0, {
          ref_key: "corteComponentRef",
          ref: corteComponentRef,
          "materiais-iniciais": materiais.value,
          "ops-iniciais": ops.value,
          "produto-base": produtoBase.value
        }, null, _parent));
        _push(`<!--]-->`);
      } else {
        _push(`<div class="loading-overlay" data-v-8f3cbe5f><div class="spinner" data-v-8f3cbe5f></div><p data-v-8f3cbe5f>Sincronizando dados de produ\xE7\xE3o...</p></div>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/corte.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const corte = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-8f3cbe5f"]]);

export { corte as default };
//# sourceMappingURL=corte-TKdL8CbG.mjs.map
