import { _ as __nuxt_component_0 } from './Corte-CAggE82P.mjs';
import { defineComponent, ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
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
  __name: "realizacao",
  __ssrInlineRender: true,
  setup(__props) {
    const materiais = ref([]);
    const ops = ref([]);
    const produtoBase = ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Corte = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "app-wrapper" }, _attrs))} data-v-663336d3>`);
      _push(ssrRenderComponent(_component_Corte, {
        "materiais-iniciais": materiais.value,
        "ops-iniciais": ops.value,
        "produto-base": produtoBase.value
      }, null, _parent));
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
const realizacao = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-663336d3"]]);

export { realizacao as default };
//# sourceMappingURL=realizacao-Z84brQDm.mjs.map
