import mixinMemoize from '/helpers/mixin-memoize.js';
import {render} from '/lit/custom-lit.js';

export default mixinMemoize(clazz =>
  class extends clazz {
    constructor() {
      super();
      this.attachShadow({mode: 'open'});
      this.renderShadow({});
    }

    renderShadow(state) {
      render(this.shadowDom(state), this.shadowRoot);
    }
  }
);

