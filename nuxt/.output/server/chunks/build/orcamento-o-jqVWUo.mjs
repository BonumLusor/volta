import { defineComponent, ref, reactive, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrInterpolate, ssrRenderAttr, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "orcamento",
  __ssrInlineRender: true,
  setup(__props) {
    const activeTab = ref("talisca");
    ref(null);
    ref(null);
    ref(null);
    ref(null);
    ref(null);
    ref(null);
    ref(null);
    const configCorreia = ref({ largura: 1e3, comprimento: 5200, acabamento: "01 - Aberta", emenda: "01 - Padr\xE3o", grampo: "", qtdSegmentos: 1 });
    const configTalisca = ref({ ativa: true, altura: 100, recLat1: 50, recLat2: 50, passoNominal: 400, passoAjuste: 0, configuracao: "reta", segmentosFileira: 1, vao: 0, numeroFileiras: 0, compSegmento: 0, observacao: "" });
    const configGuiaSup = ref({ ativa: false, distBorda: 50, distEntreGuias: 0 });
    const configGuiaInf = ref({ ativa: false, distBorda: 25, distEntreGuias: 0, configuracao: "2laterais" });
    const configSidewall = ref({ ativa: false, distBordaBase: 25, configuracao: "lateral" });
    const configFuros = ref({ ativa: false, tipo: "1", distBorda: 50, diametro1: 15, diametro2: 0, passo: 200, qtdFileiras: 2, qtdCarreira: 0, observacoes: "" });
    const configMaoFrancesa = ref({ ativa: true, tipo: "1", altura: 80, baseInf: 60, baseSup: 0, flanco: 0, recuo: 20, vao: 60 });
    reactive({
      trans: { w: 1, h: 1, scale: 1 },
      sup: { w: 1, h: 1, scale: 1 },
      lat: { w: 1, h: 1, scale: 1 }
    });
    function calcularPrecoFicticio() {
      let base = 1250;
      if (configTalisca.value.ativa) base += 480.5;
      if (configSidewall.value.ativa) base += 320;
      if (configGuiaInf.value.ativa || configGuiaSup.value.ativa) base += 150;
      base += 250;
      return base.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "erp-container" }, _attrs))} data-v-691bcaa5><div class="erp-content" data-v-691bcaa5><div class="tabs-section" data-v-691bcaa5><div class="header-titles" data-v-691bcaa5><h2 style="${ssrRenderStyle({ "margin": "0", "color": "#1e3a8a", "font-size": "1.2rem" })}" data-v-691bcaa5>Or\xE7amento - Correias Manufaturadas</h2><span style="${ssrRenderStyle({ "font-size": "0.8rem", "color": "#64748b" })}" data-v-691bcaa5>Painel de Engenharia (Vis\xE3o Completa)</span></div><div class="tabs-actions" data-v-691bcaa5><button class="btn-secondary" style="${ssrRenderStyle({ "margin-right": "10px" })}" data-v-691bcaa5>ATUALIZAR VISTAS</button><button class="btn-success" data-v-691bcaa5>SALVAR PRODUTO</button></div></div><div class="main-grid" data-v-691bcaa5><section class="canvas-section card" data-v-691bcaa5><div class="card-header" data-v-691bcaa5><h2 class="card-title" data-v-691bcaa5>Vistas T\xE9cnicas Simult\xE2neas</h2><div class="card-tools" data-v-691bcaa5><span class="scale-badge" style="${ssrRenderStyle({ "background": "#dbeafe", "color": "#1e3a8a" })}" data-v-691bcaa5> Largura: ${ssrInterpolate(configCorreia.value.largura)} mm </span></div></div><div class="canvas-viewport" data-v-691bcaa5><div class="views-wrapper" data-v-691bcaa5><div class="view-block transversal" data-v-691bcaa5><h3 class="view-title" data-v-691bcaa5>1. Perfil Transversal (Corte Frontal)</h3><div class="canvas-container" data-v-691bcaa5><canvas data-v-691bcaa5></canvas></div></div><div class="view-block lateral" data-v-691bcaa5><h3 class="view-title" data-v-691bcaa5>3. Vista Lateral (Perfil Longitudinal)</h3><div class="canvas-container" data-v-691bcaa5><canvas data-v-691bcaa5></canvas></div></div><div class="view-block superior" data-v-691bcaa5><h3 class="view-title" data-v-691bcaa5>2. Vista Superior (Topo - Segmento M\xE1x 1.5m)</h3><div class="canvas-container" data-v-691bcaa5><canvas data-v-691bcaa5></canvas></div></div></div></div></section><aside class="side-panel" data-v-691bcaa5><div class="card properties-card" data-v-691bcaa5><div class="card-header" data-v-691bcaa5><h2 class="card-title" data-v-691bcaa5>Correia Base</h2></div><div class="card-body" data-v-691bcaa5><div class="property-form" data-v-691bcaa5><div class="form-grid" data-v-691bcaa5><div class="form-group full-width" data-v-691bcaa5><label data-v-691bcaa5>Produto (Correia)</label><select class="erp-input" data-v-691bcaa5><option data-v-691bcaa5>PU VOLTA BELTING - HOMOG\xCANEAS</option><option data-v-691bcaa5>PVC SANIT\xC1RIO</option></select></div><div class="form-group" data-v-691bcaa5><label data-v-691bcaa5>Largura (mm)</label><input type="number"${ssrRenderAttr("value", configCorreia.value.largura)} class="erp-input" data-v-691bcaa5></div><div class="form-group" data-v-691bcaa5><label data-v-691bcaa5>Comprimento (mm)</label><input type="number"${ssrRenderAttr("value", configCorreia.value.comprimento)} class="erp-input" data-v-691bcaa5></div><div class="form-group" data-v-691bcaa5><label data-v-691bcaa5>Acabamento</label><select class="erp-input" data-v-691bcaa5><option data-v-691bcaa5${ssrIncludeBooleanAttr(Array.isArray(configCorreia.value.acabamento) ? ssrLooseContain(configCorreia.value.acabamento, null) : ssrLooseEqual(configCorreia.value.acabamento, null)) ? " selected" : ""}>01 - Aberta</option><option data-v-691bcaa5${ssrIncludeBooleanAttr(Array.isArray(configCorreia.value.acabamento) ? ssrLooseContain(configCorreia.value.acabamento, null) : ssrLooseEqual(configCorreia.value.acabamento, null)) ? " selected" : ""}>02 - Fechada</option></select></div><div class="form-group" data-v-691bcaa5><label data-v-691bcaa5>Emenda</label><select class="erp-input" data-v-691bcaa5><option data-v-691bcaa5${ssrIncludeBooleanAttr(Array.isArray(configCorreia.value.emenda) ? ssrLooseContain(configCorreia.value.emenda, null) : ssrLooseEqual(configCorreia.value.emenda, null)) ? " selected" : ""}>01 - Padr\xE3o</option><option data-v-691bcaa5${ssrIncludeBooleanAttr(Array.isArray(configCorreia.value.emenda) ? ssrLooseContain(configCorreia.value.emenda, null) : ssrLooseEqual(configCorreia.value.emenda, null)) ? " selected" : ""}>02 - Especial</option></select></div><div class="form-group" data-v-691bcaa5><label data-v-691bcaa5>Grampo</label><input type="text"${ssrRenderAttr("value", configCorreia.value.grampo)} class="erp-input" data-v-691bcaa5></div><div class="form-group" data-v-691bcaa5><label data-v-691bcaa5>Qtd. Segmentos</label><input type="number"${ssrRenderAttr("value", configCorreia.value.qtdSegmentos)} class="erp-input" data-v-691bcaa5></div></div></div></div></div><div class="card accessories-card" data-v-691bcaa5><div class="tabs-navigation accessories-tabs" data-v-691bcaa5><button class="${ssrRenderClass([{ active: activeTab.value === "talisca" }, "erp-tab mini"])}" data-v-691bcaa5>Talisca</button><button class="${ssrRenderClass([{ active: activeTab.value === "guiasup" }, "erp-tab mini"])}" data-v-691bcaa5>Guia Sup.</button><button class="${ssrRenderClass([{ active: activeTab.value === "guiainf" }, "erp-tab mini"])}" data-v-691bcaa5>Guia Inf.</button><button class="${ssrRenderClass([{ active: activeTab.value === "sidewall" }, "erp-tab mini"])}" data-v-691bcaa5>SideWall</button><button class="${ssrRenderClass([{ active: activeTab.value === "furos" }, "erp-tab mini"])}" data-v-691bcaa5>Furos</button><button class="${ssrRenderClass([{ active: activeTab.value === "maofrancesa" }, "erp-tab mini"])}" data-v-691bcaa5>M\xE3o Fran.</button></div><div class="card-body scrollable-body" data-v-691bcaa5>`);
      if (activeTab.value === "talisca") {
        _push(`<div class="property-form" data-v-691bcaa5><div class="switch-container mb-10" data-v-691bcaa5><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(configTalisca.value.ativa) ? ssrLooseContain(configTalisca.value.ativa, null) : configTalisca.value.ativa) ? " checked" : ""} data-v-691bcaa5> <label data-v-691bcaa5>Incluir Taliscas</label></div><div class="${ssrRenderClass([{ "disabled-section": !configTalisca.value.ativa }, "form-grid"])}" data-v-691bcaa5><div class="form-group full-width" data-v-691bcaa5><label data-v-691bcaa5>Produto</label><select class="erp-input" data-v-691bcaa5><option data-v-691bcaa5>FMB 5</option></select></div><div class="form-group" data-v-691bcaa5><label data-v-691bcaa5>Altura (mm)</label><input type="number"${ssrRenderAttr("value", configTalisca.value.altura)} class="erp-input" data-v-691bcaa5></div><div class="form-group" data-v-691bcaa5><label data-v-691bcaa5>Passo Nominal (mm)</label><input type="number"${ssrRenderAttr("value", configTalisca.value.passoNominal)} class="erp-input" data-v-691bcaa5></div><div class="form-group" data-v-691bcaa5><label data-v-691bcaa5>Rec Lat 1 (mm)</label><input type="number"${ssrRenderAttr("value", configTalisca.value.recLat1)} class="erp-input" data-v-691bcaa5></div><div class="form-group" data-v-691bcaa5><label data-v-691bcaa5>Rec Lat 2 (mm)</label><input type="number"${ssrRenderAttr("value", configTalisca.value.recLat2)} class="erp-input" data-v-691bcaa5></div><div class="form-group" data-v-691bcaa5><label data-v-691bcaa5>Segmentos p/ Fileira</label><input type="number"${ssrRenderAttr("value", configTalisca.value.segmentosFileira)} class="erp-input" data-v-691bcaa5></div><div class="form-group" data-v-691bcaa5><label data-v-691bcaa5>V\xE3o (mm)</label><input type="number"${ssrRenderAttr("value", configTalisca.value.vao)} class="erp-input" data-v-691bcaa5></div><div class="form-group" data-v-691bcaa5><label data-v-691bcaa5>N\xFAmero de Fileiras</label><input type="number"${ssrRenderAttr("value", configTalisca.value.numeroFileiras)} class="erp-input bg-readonly" readonly data-v-691bcaa5></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (activeTab.value === "guiasup") {
        _push(`<div class="property-form" data-v-691bcaa5><div class="switch-container mb-10" data-v-691bcaa5><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(configGuiaSup.value.ativa) ? ssrLooseContain(configGuiaSup.value.ativa, null) : configGuiaSup.value.ativa) ? " checked" : ""} data-v-691bcaa5> <label data-v-691bcaa5>Incluir Guia Superior</label></div><div class="${ssrRenderClass([{ "disabled-section": !configGuiaSup.value.ativa }, "form-grid"])}" data-v-691bcaa5><div class="form-group" data-v-691bcaa5><label data-v-691bcaa5>Dist\xE2ncia da Borda (mm)</label><input type="number"${ssrRenderAttr("value", configGuiaSup.value.distBorda)} class="erp-input" data-v-691bcaa5></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (activeTab.value === "guiainf") {
        _push(`<div class="property-form" data-v-691bcaa5><div class="switch-container mb-10" data-v-691bcaa5><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(configGuiaInf.value.ativa) ? ssrLooseContain(configGuiaInf.value.ativa, null) : configGuiaInf.value.ativa) ? " checked" : ""} data-v-691bcaa5> <label data-v-691bcaa5>Incluir Guia Inferior</label></div><div class="${ssrRenderClass([{ "disabled-section": !configGuiaInf.value.ativa }, "form-grid"])}" data-v-691bcaa5><div class="form-group full-width" data-v-691bcaa5><label data-v-691bcaa5>Produto (Guia)</label><select class="erp-input" data-v-691bcaa5><option data-v-691bcaa5>VL 13/A</option></select></div><div class="form-group" data-v-691bcaa5><label data-v-691bcaa5>Dist\xE2ncia da Borda (mm)</label><input type="number"${ssrRenderAttr("value", configGuiaInf.value.distBorda)} class="erp-input" data-v-691bcaa5></div><div class="form-group full-width" data-v-691bcaa5><label data-v-691bcaa5>Configura\xE7\xE3o</label><select class="erp-input" data-v-691bcaa5><option value="central" data-v-691bcaa5${ssrIncludeBooleanAttr(Array.isArray(configGuiaInf.value.configuracao) ? ssrLooseContain(configGuiaInf.value.configuracao, "central") : ssrLooseEqual(configGuiaInf.value.configuracao, "central")) ? " selected" : ""}>Central</option><option value="1lateral" data-v-691bcaa5${ssrIncludeBooleanAttr(Array.isArray(configGuiaInf.value.configuracao) ? ssrLooseContain(configGuiaInf.value.configuracao, "1lateral") : ssrLooseEqual(configGuiaInf.value.configuracao, "1lateral")) ? " selected" : ""}>1 Lateral</option><option value="2laterais" data-v-691bcaa5${ssrIncludeBooleanAttr(Array.isArray(configGuiaInf.value.configuracao) ? ssrLooseContain(configGuiaInf.value.configuracao, "2laterais") : ssrLooseEqual(configGuiaInf.value.configuracao, "2laterais")) ? " selected" : ""}>2 Laterais</option></select></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (activeTab.value === "sidewall") {
        _push(`<div class="property-form" data-v-691bcaa5><div class="switch-container mb-10" data-v-691bcaa5><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(configSidewall.value.ativa) ? ssrLooseContain(configSidewall.value.ativa, null) : configSidewall.value.ativa) ? " checked" : ""} data-v-691bcaa5> <label data-v-691bcaa5>Incluir SideWall</label></div><div class="${ssrRenderClass([{ "disabled-section": !configSidewall.value.ativa }, "form-grid"])}" data-v-691bcaa5><div class="form-group full-width" data-v-691bcaa5><label data-v-691bcaa5>Produto (SideWall)</label><select class="erp-input" data-v-691bcaa5><option data-v-691bcaa5>SWB 30</option></select></div><div class="form-group" data-v-691bcaa5><label data-v-691bcaa5>Dist. da Borda \xE0 Base</label><input type="number"${ssrRenderAttr("value", configSidewall.value.distBordaBase)} class="erp-input" data-v-691bcaa5></div><div class="form-group" data-v-691bcaa5><label data-v-691bcaa5>Configura\xE7\xE3o</label><select class="erp-input" data-v-691bcaa5><option value="lateral" data-v-691bcaa5${ssrIncludeBooleanAttr(Array.isArray(configSidewall.value.configuracao) ? ssrLooseContain(configSidewall.value.configuracao, "lateral") : ssrLooseEqual(configSidewall.value.configuracao, "lateral")) ? " selected" : ""}>Lateral (Duas Bordas)</option><option value="central" data-v-691bcaa5${ssrIncludeBooleanAttr(Array.isArray(configSidewall.value.configuracao) ? ssrLooseContain(configSidewall.value.configuracao, "central") : ssrLooseEqual(configSidewall.value.configuracao, "central")) ? " selected" : ""}>Central</option></select></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (activeTab.value === "furos") {
        _push(`<div class="property-form" data-v-691bcaa5><div class="switch-container mb-10" data-v-691bcaa5><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(configFuros.value.ativa) ? ssrLooseContain(configFuros.value.ativa, null) : configFuros.value.ativa) ? " checked" : ""} data-v-691bcaa5> <label data-v-691bcaa5>Incluir Fura\xE7\xE3o</label></div><div class="${ssrRenderClass([{ "disabled-section": !configFuros.value.ativa }, "form-grid"])}" data-v-691bcaa5><div class="form-group" data-v-691bcaa5><label data-v-691bcaa5>Dist\xE2ncia da Borda (mm)</label><input type="number"${ssrRenderAttr("value", configFuros.value.distBorda)} class="erp-input" data-v-691bcaa5></div><div class="form-group" data-v-691bcaa5><label data-v-691bcaa5>Di\xE2metro Furo 1 (mm)</label><input type="number"${ssrRenderAttr("value", configFuros.value.diametro1)} class="erp-input" data-v-691bcaa5></div><div class="form-group" data-v-691bcaa5><label data-v-691bcaa5>Passo Longitudinal (mm)</label><input type="number"${ssrRenderAttr("value", configFuros.value.passo)} class="erp-input" data-v-691bcaa5></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (activeTab.value === "maofrancesa") {
        _push(`<div class="property-form" data-v-691bcaa5><div class="switch-container mb-10" data-v-691bcaa5><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(configMaoFrancesa.value.ativa) ? ssrLooseContain(configMaoFrancesa.value.ativa, null) : configMaoFrancesa.value.ativa) ? " checked" : ""} data-v-691bcaa5> <label data-v-691bcaa5>Incluir M\xE3o Francesa</label></div><div class="${ssrRenderClass([{ "disabled-section": !configMaoFrancesa.value.ativa }, "form-grid"])}" data-v-691bcaa5><div class="form-group" data-v-691bcaa5><label data-v-691bcaa5>Altura (mm)</label><input type="number"${ssrRenderAttr("value", configMaoFrancesa.value.altura)} class="erp-input" data-v-691bcaa5></div><div class="form-group" data-v-691bcaa5><label data-v-691bcaa5>Base Inferior (mm)</label><input type="number"${ssrRenderAttr("value", configMaoFrancesa.value.baseInf)} class="erp-input" data-v-691bcaa5></div><div class="form-group" data-v-691bcaa5><label data-v-691bcaa5>Recuo Apoio (mm)</label><input type="number"${ssrRenderAttr("value", configMaoFrancesa.value.recuo)} class="erp-input" data-v-691bcaa5></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="card price-card" data-v-691bcaa5><div class="card-header" data-v-691bcaa5><h2 class="card-title" data-v-691bcaa5>Memorial de C\xE1lculo</h2></div><div class="card-body" data-v-691bcaa5><div class="price-grid" data-v-691bcaa5><span data-v-691bcaa5>Correia Base:</span> <span data-v-691bcaa5>R$ 1.250,00</span>`);
      if (configTalisca.value.ativa) {
        _push(`<span data-v-691bcaa5>Taliscas:</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(` `);
      if (configTalisca.value.ativa) {
        _push(`<span data-v-691bcaa5>R$ 480,50</span>`);
      } else {
        _push(`<!---->`);
      }
      if (configSidewall.value.ativa) {
        _push(`<span data-v-691bcaa5>SideWall:</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(` `);
      if (configSidewall.value.ativa) {
        _push(`<span data-v-691bcaa5>R$ 320,00</span>`);
      } else {
        _push(`<!---->`);
      }
      if (configGuiaInf.value.ativa || configGuiaSup.value.ativa) {
        _push(`<span data-v-691bcaa5>Guias Inf/Sup:</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(` `);
      if (configGuiaInf.value.ativa || configGuiaSup.value.ativa) {
        _push(`<span data-v-691bcaa5>R$ 150,00</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<span data-v-691bcaa5>M\xE3o de Obra:</span> <span data-v-691bcaa5>R$ 250,00</span><strong class="total-row" data-v-691bcaa5>Valor Total:</strong> <strong class="total-row" data-v-691bcaa5>R$ ${ssrInterpolate(calcularPrecoFicticio())}</strong></div></div></div></aside></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/orcamento.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const orcamento = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-691bcaa5"]]);

export { orcamento as default };
//# sourceMappingURL=orcamento-o-jqVWUo.mjs.map
