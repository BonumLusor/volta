import { defineComponent, ref, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderStyle, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
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
  __name: "ops",
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    const materialSelecionado = ref(null);
    const listaSaldos = ref([]);
    const saldosSelecionados = ref([]);
    const carregando = ref(true);
    const podeConfirmar = computed(() => saldosSelecionados.value.length > 0);
    const resumoSelecao = computed(() => `${saldosSelecionados.value.length} Lotes`);
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "erp-container" }, _attrs))} data-v-a7e1ed9c><div class="erp-content" data-v-a7e1ed9c><header class="erp-header" data-v-a7e1ed9c><div class="title-group" data-v-a7e1ed9c><h1 class="erp-title" data-v-a7e1ed9c>Sele\xE7\xE3o de Lotes em Estoque</h1><p class="erp-subtitle" data-v-a7e1ed9c> Produto selecionado: <strong data-v-a7e1ed9c>${ssrInterpolate(((_a = materialSelecionado.value) == null ? void 0 : _a.nome_produto) || "Carregando...")}</strong></p></div><button class="btn-primary"${ssrIncludeBooleanAttr(!podeConfirmar.value) ? " disabled" : ""} data-v-a7e1ed9c> Selecionar OP&#39;s (${ssrInterpolate(resumoSelecao.value)}) </button></header><div class="" data-v-a7e1ed9c><section class="column card" data-v-a7e1ed9c><div class="card-header" data-v-a7e1ed9c><h2 class="card-title" data-v-a7e1ed9c>Lotes Dispon\xEDveis (Saldo)</h2><span class="count-badge" data-v-a7e1ed9c>${ssrInterpolate(listaSaldos.value.length)}</span></div><div class="card-body no-padding scroll-area" data-v-a7e1ed9c>`);
      if (carregando.value) {
        _push(`<div class="loading-state" data-v-a7e1ed9c> Carregando saldos... </div>`);
      } else {
        _push(`<table class="erp-table" data-v-a7e1ed9c><thead data-v-a7e1ed9c><tr data-v-a7e1ed9c><th style="${ssrRenderStyle({ "width": "50px" })}" data-v-a7e1ed9c>Sele\xE7\xE3o</th><th data-v-a7e1ed9c>Lote / Produto</th><th data-v-a7e1ed9c>Endere\xE7o / Armaz\xE9m</th><th data-v-a7e1ed9c>Quantidade Dispon\xEDvel</th></tr></thead><tbody data-v-a7e1ed9c><!--[-->`);
        ssrRenderList(listaSaldos.value, (item) => {
          var _a2;
          _push(`<tr class="${ssrRenderClass({ selected: saldosSelecionados.value.find((s) => s.lote === item.lote) })}" data-v-a7e1ed9c><td class="text-center" data-v-a7e1ed9c><input type="checkbox"${ssrIncludeBooleanAttr(!!saldosSelecionados.value.find((s) => s.lote === item.lote)) ? " checked" : ""} data-v-a7e1ed9c></td><td data-v-a7e1ed9c><strong data-v-a7e1ed9c>${ssrInterpolate(item.lote || "S/N")}</strong>`);
          if (item.produto) {
            _push(`<div style="${ssrRenderStyle({ "font-size": "0.85rem", "color": "#444", "margin": "2px 0" })}" data-v-a7e1ed9c>${ssrInterpolate(item.produto)}</div>`);
          } else {
            _push(`<!---->`);
          }
          if (item.largura || item.comprimento) {
            _push(`<div style="${ssrRenderStyle({ "font-size": "0.8em", "color": "#666" })}" data-v-a7e1ed9c>${ssrInterpolate(item.largura)} x ${ssrInterpolate(item.comprimento)} mm </div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td><td data-v-a7e1ed9c>${ssrInterpolate(item.armazem || "Geral")}</td><td data-v-a7e1ed9c><span class="status-tag available" data-v-a7e1ed9c>${ssrInterpolate(item.saldo)} ${ssrInterpolate(item.un || ((_a2 = materialSelecionado.value) == null ? void 0 : _a2.un) || "UN")}</span></td></tr>`);
        });
        _push(`<!--]-->`);
        if (listaSaldos.value.length === 0) {
          _push(`<tr data-v-a7e1ed9c><td colspan="4" class="text-center" style="${ssrRenderStyle({ "padding": "20px" })}" data-v-a7e1ed9c> Nenhum saldo encontrado para este produto. </td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table>`);
      }
      _push(`</div></section></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/ops.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ops = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-a7e1ed9c"]]);

export { ops as default };
//# sourceMappingURL=ops-C-7nnoLu.mjs.map
