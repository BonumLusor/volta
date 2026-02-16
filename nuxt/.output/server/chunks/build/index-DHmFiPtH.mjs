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
    const listaRolos = ref([
      {
        id: "R1",
        nome: "Bobina Master 1200",
        largura: 1200,
        comprimento: 5e3,
        cortesExistentes: [
          { x: 0, y: 0, width: 1200, height: 200, op: "FIXO", color: "#94a3b8", fixed: true }
        ]
      },
      {
        id: "R2",
        nome: "Retalho A",
        largura: 400,
        comprimento: 800,
        cortesExistentes: []
      },
      {
        id: "R3",
        nome: "Bobina Kraft 900",
        largura: 900,
        comprimento: 3e3,
        cortesExistentes: [
          { x: 0, y: 0, width: 400, height: 400, op: "FIXO", color: "#94a3b8", fixed: true }
        ]
      }
    ]);
    const opsDisponiveis = ref([
      {
        id: 2134,
        cliente: "Indústria Metal",
        cortes: [
          { width: 300, height: 400, color: "#3b82f6" },
          { width: 200, height: 200, color: "#3b82f6" }
        ]
      },
      {
        id: 543,
        cliente: "Logística Express",
        cortes: [
          { width: 500, height: 300, color: "#ef4444" }
        ]
      },
      {
        id: 2033,
        cliente: "Tech Solutions",
        cortes: [
          { width: 150, height: 150, color: "#10b981" },
          { width: 150, height: 150, color: "#10b981" },
          { width: 150, height: 150, color: "#10b981" }
        ]
      }
    ]);
    const rolosSelecionados = ref([]);
    const opsSelecionadas = ref([]);
    const podeConfirmar = computed(() => rolosSelecionados.value.length > 0 && opsSelecionadas.value.length > 0);
    const resumoSelecao = computed(() => `${rolosSelecionados.value.length} Rolos, ${opsSelecionadas.value.length} OPs`);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "erp-container" }, _attrs))} data-v-fa6bf8dc><div class="erp-content" data-v-fa6bf8dc><header class="erp-header" data-v-fa6bf8dc><div class="title-group" data-v-fa6bf8dc><h1 class="erp-title" data-v-fa6bf8dc>Configuração de Lote de Corte</h1><p class="erp-subtitle" data-v-fa6bf8dc>Selecione as matérias-primas e as ordens de produção para o plano.</p></div><button class="btn-primary"${ssrIncludeBooleanAttr(!podeConfirmar.value) ? " disabled" : ""} data-v-fa6bf8dc> CONFIRMAR E GERAR PLANO (${ssrInterpolate(resumoSelecao.value)}) </button></header><div class="main-grid" data-v-fa6bf8dc><section class="column card" data-v-fa6bf8dc><div class="card-header" data-v-fa6bf8dc><h2 class="card-title" data-v-fa6bf8dc>1. Materiais (Rolos)</h2><span class="count-badge" data-v-fa6bf8dc>${ssrInterpolate(rolosSelecionados.value.length)}</span></div><div class="card-body no-padding scroll-area" data-v-fa6bf8dc><table class="erp-table" data-v-fa6bf8dc><thead data-v-fa6bf8dc><tr data-v-fa6bf8dc><th data-v-fa6bf8dc>Seleção</th><th data-v-fa6bf8dc>Material</th><th data-v-fa6bf8dc>Dimensões</th><th data-v-fa6bf8dc>Status</th></tr></thead><tbody data-v-fa6bf8dc><!--[-->`);
      ssrRenderList(listaRolos.value, (rolo) => {
        _push(`<tr class="${ssrRenderClass({ selected: rolosSelecionados.value.find((r) => r.id === rolo.id) })}" data-v-fa6bf8dc><td class="text-center" data-v-fa6bf8dc><input type="checkbox"${ssrIncludeBooleanAttr(!!rolosSelecionados.value.find((r) => r.id === rolo.id)) ? " checked" : ""} data-v-fa6bf8dc></td><td data-v-fa6bf8dc><strong data-v-fa6bf8dc>${ssrInterpolate(rolo.nome)}</strong></td><td data-v-fa6bf8dc>${ssrInterpolate(rolo.largura)} x ${ssrInterpolate(rolo.comprimento)} mm</td><td data-v-fa6bf8dc>`);
        if (rolo.cortesExistentes.length > 0) {
          _push(`<span class="status-tag occupied" data-v-fa6bf8dc>Cortado</span>`);
        } else {
          _push(`<span class="status-tag available" data-v-fa6bf8dc>Novo</span>`);
        }
        _push(`</td></tr>`);
      });
      _push(`<!--]--></tbody></table></div></section><section class="column card" data-v-fa6bf8dc><div class="card-header" data-v-fa6bf8dc><h2 class="card-title" data-v-fa6bf8dc>2. Ordens de Produção (OPs)</h2><span class="count-badge" data-v-fa6bf8dc>${ssrInterpolate(opsSelecionadas.value.length)}</span></div><div class="card-body no-padding scroll-area" data-v-fa6bf8dc><table class="erp-table" data-v-fa6bf8dc><thead data-v-fa6bf8dc><tr data-v-fa6bf8dc><th data-v-fa6bf8dc>Seleção</th><th data-v-fa6bf8dc>OP</th><th data-v-fa6bf8dc>Cliente</th><th data-v-fa6bf8dc>Cortes</th></tr></thead><tbody data-v-fa6bf8dc><!--[-->`);
      ssrRenderList(opsDisponiveis.value, (op) => {
        _push(`<tr class="${ssrRenderClass({ selected: opsSelecionadas.value.find((o) => o.id === op.id) })}" data-v-fa6bf8dc><td class="text-center" data-v-fa6bf8dc><input type="checkbox"${ssrIncludeBooleanAttr(!!opsSelecionadas.value.find((o) => o.id === op.id)) ? " checked" : ""} data-v-fa6bf8dc></td><td data-v-fa6bf8dc><strong data-v-fa6bf8dc>#${ssrInterpolate(op.id)}</strong></td><td data-v-fa6bf8dc>${ssrInterpolate(op.cliente)}</td><td data-v-fa6bf8dc>${ssrInterpolate(op.cortes.length)} itens</td></tr>`);
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
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-fa6bf8dc"]]);

export { index as default };
//# sourceMappingURL=index-DHmFiPtH.mjs.map
