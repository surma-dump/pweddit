import {render} from '/lit/custom-lit.js';

const defaultOpts = {
  noInitRender: false
};

export default function litShadow(tpl, clazz, opts = {}) {
  opts = Object.assign({}, defaultOpts, opts);
  return class LitShadow extends clazz {
    constructor() {
      super();
      this.attachShadow({mode: 'open'});
      if (!opts.noInitRender)
        this.renderShadow({});
    }

    renderShadow(state) {
      render(tpl(state), this.shadowRoot);
    }
  };
}
