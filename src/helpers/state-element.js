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
        template = new Template(this.lightDom);
      }
      return template;
    }

    static instantiate(state) {
      const instance = this.template.instantiate(this.update.bind(this));
      instance.update(state);
      return instance;
    }

    static renderTo(container, state) {
      this.template.instantiateTo(container, this.update).update(state);
    }
  }
});
