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
  __name: "rolos",
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    const materialSelecionado = ref(null);
    const listaSaldos = ref([]);
    const saldosSelecionados = ref([]);
    const carregando = ref(true);
    const listaOps = ref([]);
    const opsSelecionadas = ref([]);
    const carregandoOps = ref(true);
    const podeConfirmar = computed(() => saldosSelecionados.value.length > 0);
    const resumoSelecao = computed(() => {
      return `${saldosSelecionados.value.length} Lotes, ${opsSelecionadas.value.length} OPs`;
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "erp-container" }, _attrs))} data-v-b4350071><div class="erp-content" data-v-b4350071><header class="erp-header" data-v-b4350071><div class="title-group" data-v-b4350071><h1 class="erp-title" data-v-b4350071>Planejamento de Corte</h1><p class="erp-subtitle" data-v-b4350071> Produto: <strong data-v-b4350071>${ssrInterpolate(((_a = materialSelecionado.value) == null ? void 0 : _a.nome_produto) || "Carregando...")}</strong></p></div><button class="btn-primary"${ssrIncludeBooleanAttr(!podeConfirmar.value) ? " disabled" : ""} data-v-b4350071> CONFIRMAR (${ssrInterpolate(resumoSelecao.value)}) </button></header><div class="main-grid" data-v-b4350071><section class="column card" data-v-b4350071><div class="card-header" data-v-b4350071><h2 class="card-title" data-v-b4350071>1. Lotes Dispon\xEDveis (Estoque)</h2><span class="count-badge" data-v-b4350071>${ssrInterpolate(listaSaldos.value.length)}</span></div><div class="card-body no-padding scroll-area" data-v-b4350071>`);
      if (carregando.value) {
        _push(`<div class="loading-state" data-v-b4350071> Carregando estoque... </div>`);
      } else {
        _push(`<table class="erp-table" data-v-b4350071><thead data-v-b4350071><tr data-v-b4350071><th style="${ssrRenderStyle({ "width": "40px" })}" data-v-b4350071></th><th data-v-b4350071>Lote</th><th data-v-b4350071>Dep\xF3sito</th><th data-v-b4350071>Localiza\xE7\xE3o</th><th data-v-b4350071>Qtd</th></tr></thead><tbody data-v-b4350071><!--[-->`);
        ssrRenderList(listaSaldos.value, (item) => {
          _push(`<tr class="${ssrRenderClass({
            selected: saldosSelecionados.value.find((s) => s.lote === item.lote),
            "row-cortado": item.nr_serie === "CORTADO"
          })}" data-v-b4350071><td class="text-center" data-v-b4350071><input type="checkbox"${ssrIncludeBooleanAttr(!!saldosSelecionados.value.find((s) => s.lote === item.lote)) ? " checked" : ""} data-v-b4350071></td><td data-v-b4350071><div class="lote-info" data-v-b4350071><strong data-v-b4350071>${ssrInterpolate(item.lote || "S/N")}</strong>`);
          if (item.nr_serie === "CORTADO") {
            _push(`<span class="status-tag cut-badge" data-v-b4350071> CORTADO </span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
          if (item.largura) {
            _push(`<div class="dimensao-info" data-v-b4350071>${ssrInterpolate(item.largura)} x ${ssrInterpolate(item.comprimento)} mm </div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td><td data-v-b4350071><span class="deposito-text" data-v-b4350071>${ssrInterpolate(item.cod_deposito)}</span></td><td data-v-b4350071>${ssrInterpolate(item.localizacao || "-")}</td><td data-v-b4350071><span class="status-tag available" data-v-b4350071>${ssrInterpolate(item.saldo)} ${ssrInterpolate(item.un)}</span></td></tr>`);
        });
        _push(`<!--]-->`);
        if (!carregando.value && listaSaldos.value.length === 0) {
          _push(`<tr data-v-b4350071><td colspan="5" class="text-center" style="${ssrRenderStyle({ "padding": "20px" })}" data-v-b4350071> Sem saldo. </td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table>`);
      }
      _push(`</div></section><section class="column card" data-v-b4350071><div class="card-header" data-v-b4350071><h2 class="card-title" data-v-b4350071>2. Ordens de Produ\xE7\xE3o (OPs)</h2><span class="count-badge" data-v-b4350071>${ssrInterpolate(listaOps.value.length)}</span></div><div class="card-body no-padding scroll-area" data-v-b4350071>`);
      if (carregandoOps.value) {
        _push(`<div class="loading-state" data-v-b4350071> Carregando OPs... </div>`);
      } else {
        _push(`<table class="erp-table" data-v-b4350071><thead data-v-b4350071><tr data-v-b4350071><th style="${ssrRenderStyle({ "width": "40px" })}" data-v-b4350071></th><th data-v-b4350071>OP / Pedido</th><th data-v-b4350071>Produto / Dimens\xF5es</th><th data-v-b4350071>Entrega</th><th data-v-b4350071>Qtd</th></tr></thead><tbody data-v-b4350071><!--[-->`);
        ssrRenderList(listaOps.value, (op) => {
          _push(`<tr class="${ssrRenderClass({ selected: opsSelecionadas.value.find((o) => o.cod_op === op.cod_op) })}" data-v-b4350071><td class="text-center" data-v-b4350071><input type="checkbox"${ssrIncludeBooleanAttr(!!opsSelecionadas.value.find((o) => o.cod_op === op.cod_op)) ? " checked" : ""} data-v-b4350071></td><td data-v-b4350071><strong data-v-b4350071>OP ${ssrInterpolate(op.cod_op)}</strong>`);
          if (op.cod_pedido) {
            _push(`<div style="${ssrRenderStyle({ "font-size": "0.75rem", "color": "#666" })}" data-v-b4350071> Ped: ${ssrInterpolate(op.cod_pedido)}</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td><td data-v-b4350071><div style="${ssrRenderStyle({ "font-weight": "500", "font-size": "0.85rem" })}" data-v-b4350071>${ssrInterpolate(op.produto_final)}</div><div style="${ssrRenderStyle({ "font-size": "0.75rem", "color": "#666" })}" data-v-b4350071>${ssrInterpolate(op.largura_corte)} x ${ssrInterpolate(op.comprimento_corte)} mm </div></td><td style="${ssrRenderStyle({ "white-space": "nowrap" })}" data-v-b4350071>${ssrInterpolate(op.dt_comprometida ? new Date(op.dt_comprometida).toLocaleDateString("pt-BR") : "-")}</td><td data-v-b4350071><span class="status-tag demand" data-v-b4350071>${ssrInterpolate(op.qtd)} ${ssrInterpolate(op.un || "UN")}</span></td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
      }
      _push(`</div></section></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/rolos.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const rolos = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b4350071"]]);

export { rolos as default };
//# sourceMappingURL=rolos-CVs0qPwQ.mjs.map
