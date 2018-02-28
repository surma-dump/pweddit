import mixinMemoize from './mixin-memoize.js';
import {Template} from '../helpers/templatetools.js';

export default mixinMemoize(clazz => {
  let template = null;
  return class extends clazz {
    constructor() {
      super();
    }

    static get template() {
      if (!template) {
        template = new Template(this.lightDom, this.update.bind(this));
      }
      return template;
    }

    static instantiate(state = {}) {
      const instance = this.template.instantiate();
      instance.update(state);
      return instance;
    }

    static renderTo(container, state = {}) {
      this.template.instantiateTo(container, state);
    }
  }
});
