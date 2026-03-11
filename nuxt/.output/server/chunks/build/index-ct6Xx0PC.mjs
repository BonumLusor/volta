import { defineComponent, ref, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    const materiais = ref([]);
    const materialSelecionado = ref(null);
    fetch("https://volta.automaportal.com.br/api/mysql/pp_op_liberada").then((response) => response.json()).then((data) => {
      materiais.value = data;
      console.log("Materiais carregados:", data);
    }).catch((error) => console.error("Erro ao buscar dados:", error));
    const podeConfirmar = computed(() => materialSelecionado.value !== null);
    const resumoSelecao = computed(() => materialSelecionado.value ? "1 Selecionado" : "Nenhum");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "erp-container" }, _attrs))} data-v-d751e752><div class="erp-content" data-v-d751e752><header class="erp-header" data-v-d751e752><div class="title-group" data-v-d751e752><h1 class="erp-title" data-v-d751e752>Configura\xE7\xE3o de Lote de Corte</h1><p class="erp-subtitle" data-v-d751e752>Selecione as mat\xE9rias-primas e as ordens de produ\xE7\xE3o para o plano.</p></div><button class="btn-primary"${ssrIncludeBooleanAttr(!podeConfirmar.value) ? " disabled" : ""} data-v-d751e752> Selecionar OP&#39;s (${ssrInterpolate(resumoSelecao.value)}) </button></header><div class="" data-v-d751e752><section class="column card" data-v-d751e752><div class="card-header" data-v-d751e752><h2 class="card-title" data-v-d751e752>1. Materiais (Rolos)</h2><span class="count-badge" data-v-d751e752>${ssrInterpolate(materialSelecionado.value ? 1 : 0)}</span></div><div class="card-body no-padding scroll-area" data-v-d751e752><table class="erp-table" data-v-d751e752><thead data-v-d751e752><tr data-v-d751e752><th data-v-d751e752>Sele\xE7\xE3o</th><th data-v-d751e752>Material</th></tr></thead><tbody data-v-d751e752><!--[-->`);
      ssrRenderList(materiais.value, (material) => {
        var _a, _b;
        _push(`<tr class="${ssrRenderClass({ selected: ((_a = materialSelecionado.value) == null ? void 0 : _a.cod_produto) === material.cod_produto })}" data-v-d751e752><td class="text-center" data-v-d751e752><input type="checkbox"${ssrIncludeBooleanAttr(((_b = materialSelecionado.value) == null ? void 0 : _b.cod_produto) === material.cod_produto) ? " checked" : ""} data-v-d751e752></td><td data-v-d751e752><strong data-v-d751e752>${ssrInterpolate(material.nome_produto)} (cod: ${ssrInterpolate(material.cod_produto)})</strong></td></tr>`);
      });
      _push(`<!--]--></tbody></table></div></section></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d751e752"]]);

export { index as default };
//# sourceMappingURL=index-ct6Xx0PC.mjs.map
