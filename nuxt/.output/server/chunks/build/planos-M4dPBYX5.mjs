import { defineComponent, ref, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderClass, ssrRenderStyle } from 'vue/server-renderer';
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
  __name: "planos",
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    const planos2 = ref([]);
    const planoSelecionado = ref(null);
    const carregando = ref(true);
    const podeConfirmar = computed(() => planoSelecionado.value !== null);
    const resumoSelecao = computed(() => planoSelecionado.value ? "1 Selecionado" : "Nenhum");
    const formatarData = (dataStr) => {
      if (!dataStr) return "-";
      const partes = dataStr.split("-");
      if (partes.length !== 3) return dataStr;
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "erp-container" }, _attrs))} data-v-a82b5040><div class="erp-content" data-v-a82b5040><header class="erp-header" data-v-a82b5040><div class="title-group" data-v-a82b5040><h1 class="erp-title" data-v-a82b5040>Sele\xE7\xE3o de Plano de Corte</h1><p class="erp-subtitle" data-v-a82b5040>Selecione o plano de corte planejado para iniciar a realiza\xE7\xE3o.</p></div><button class="btn-primary"${ssrIncludeBooleanAttr(!podeConfirmar.value) ? " disabled" : ""} data-v-a82b5040> Confirmar Plano (${ssrInterpolate(resumoSelecao.value)}) </button></header><div class="" data-v-a82b5040><section class="column card" data-v-a82b5040><div class="card-header" data-v-a82b5040><h2 class="card-title" data-v-a82b5040>1. Planos Dispon\xEDveis</h2><span class="count-badge" data-v-a82b5040>${ssrInterpolate(planoSelecionado.value ? 1 : 0)}</span></div><div class="card-body no-padding scroll-area" data-v-a82b5040><table class="erp-table" data-v-a82b5040><thead data-v-a82b5040><tr data-v-a82b5040><th class="text-center" data-v-a82b5040>Sele\xE7\xE3o</th><th data-v-a82b5040>N\xBA Plano</th><th data-v-a82b5040>Produto</th><th data-v-a82b5040>Data Comprometida</th></tr></thead><tbody data-v-a82b5040><!--[-->`);
      ssrRenderList(planos2.value, (plano) => {
        var _a, _b;
        _push(`<tr class="${ssrRenderClass({ selected: ((_a = planoSelecionado.value) == null ? void 0 : _a.cod_plano_corte) === plano.cod_plano_corte })}" data-v-a82b5040><td class="text-center" data-v-a82b5040><input type="checkbox"${ssrIncludeBooleanAttr(((_b = planoSelecionado.value) == null ? void 0 : _b.cod_plano_corte) === plano.cod_plano_corte) ? " checked" : ""} data-v-a82b5040></td><td data-v-a82b5040><strong data-v-a82b5040>#${ssrInterpolate(plano.cod_plano_corte)}</strong></td><td data-v-a82b5040>${ssrInterpolate(plano.nome_produto)} (C\xF3d: ${ssrInterpolate(plano.cod_produto)})</td><td data-v-a82b5040>${ssrInterpolate(formatarData(plano.dt_comprometida_pv))}</td></tr>`);
      });
      _push(`<!--]-->`);
      if (planos2.value.length === 0 && !carregando.value) {
        _push(`<tr data-v-a82b5040><td colspan="4" class="text-center" style="${ssrRenderStyle({ "padding": "20px" })}" data-v-a82b5040>Nenhum plano de corte encontrado.</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      if (carregando.value) {
        _push(`<tr data-v-a82b5040><td colspan="4" class="text-center" style="${ssrRenderStyle({ "padding": "20px" })}" data-v-a82b5040>Carregando planos...</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</tbody></table></div></section></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/planos.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const planos = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-a82b5040"]]);

export { planos as default };
//# sourceMappingURL=planos-M4dPBYX5.mjs.map
