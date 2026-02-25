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
  __name: "materiais",
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    const listaRolos = ref([
      {
        id: 1,
        nome: "Rolo A",
        largura: 1e3,
        comprimento: 2e3,
        cortesExistentes: [
          { width: 300, height: 400 },
          { width: 200, height: 200 }
        ]
      },
      {
        id: 2,
        nome: "Rolo B",
        largura: 1200,
        comprimento: 2500,
        cortesExistentes: []
      },
      {
        id: 3,
        nome: "Rolo C",
        largura: 800,
        comprimento: 1500,
        cortesExistentes: [
          { width: 500, height: 300 }
        ]
      }
    ]);
    ref([
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
    fetch("https://volta.automaportal.com.br/api/pp_op_mp_do_produto").then((response) => response.json()).then((data) => console.log("Dados de teste:", data)).catch((error) => console.error("Erro ao buscar dados de teste:", error));
    const rolosSelecionados = ref([]);
    const opsSelecionadas = ref([]);
    const podeConfirmar = computed(() => rolosSelecionados.value.length > 0 && opsSelecionadas.value.length > 0);
    const resumoSelecao = computed(() => `${rolosSelecionados.value.length} Rolos, ${opsSelecionadas.value.length} OPs`);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "erp-container" }, _attrs))} data-v-fcad3cc5><div class="erp-content" data-v-fcad3cc5><header class="erp-header" data-v-fcad3cc5><div class="title-group" data-v-fcad3cc5><h1 class="erp-title" data-v-fcad3cc5>Configuração de Lote de Corte</h1><p class="erp-subtitle" data-v-fcad3cc5>Selecione as matérias-primas e as ordens de produção para o plano.</p></div><button class="btn-primary"${ssrIncludeBooleanAttr(!podeConfirmar.value) ? " disabled" : ""} data-v-fcad3cc5> CONFIRMAR E GERAR PLANO (${ssrInterpolate(resumoSelecao.value)}) </button></header><div class="" data-v-fcad3cc5><section class="column card" data-v-fcad3cc5><div class="card-header" data-v-fcad3cc5><h2 class="card-title" data-v-fcad3cc5>1. Materiais (Rolos)</h2><span class="count-badge" data-v-fcad3cc5>${ssrInterpolate(rolosSelecionados.value.length)}</span></div><div class="card-body no-padding scroll-area" data-v-fcad3cc5><table class="erp-table" data-v-fcad3cc5><thead data-v-fcad3cc5><tr data-v-fcad3cc5><th data-v-fcad3cc5>Seleção</th><th data-v-fcad3cc5>Material</th><th data-v-fcad3cc5>Dimensões</th><th data-v-fcad3cc5>Status</th></tr></thead><tbody data-v-fcad3cc5><!--[-->`);
      ssrRenderList(listaRolos.value, (rolo) => {
        _push(`<tr class="${ssrRenderClass({ selected: rolosSelecionados.value.find((r) => r.id === rolo.id) })}" data-v-fcad3cc5><td class="text-center" data-v-fcad3cc5><input type="checkbox"${ssrIncludeBooleanAttr(!!rolosSelecionados.value.find((r) => r.id === rolo.id)) ? " checked" : ""} data-v-fcad3cc5></td><td data-v-fcad3cc5><strong data-v-fcad3cc5>${ssrInterpolate(rolo.nome)}</strong></td><td data-v-fcad3cc5>${ssrInterpolate(rolo.largura)} x ${ssrInterpolate(rolo.comprimento)} mm</td><td data-v-fcad3cc5>`);
        if (rolo.cortesExistentes.length > 0) {
          _push(`<span class="status-tag occupied" data-v-fcad3cc5>Cortado</span>`);
        } else {
          _push(`<span class="status-tag available" data-v-fcad3cc5>Novo</span>`);
        }
        _push(`</td></tr>`);
      });
      _push(`<!--]--></tbody></table></div></section></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/materiais.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const materiais = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-fcad3cc5"]]);

export { materiais as default };
//# sourceMappingURL=materiais-BlurMmir.mjs.map
