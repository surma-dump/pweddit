import mixinMemoize from './mixin-memoize.js';
import {Template} from '../helpers/templatetools.js';

export default mixinMemoize(clazz => {
  let template = null;
  return class extends clazz {
    constructor() {
      super();
      this.attachShadow({mode: 'open'});
      this.constructor.shadowTemplate.instantiateTo(this.shadowRoot);
    }

    static get shadowTemplate() {
      if (!template) {
        template = new Template(this.shadowDom);
      }
      return template;
    }
  }
});
