import {html, render} from '/lit-html/lit-html.js';

const baseClasses = new WeakMap();

export function LitElement(base) {
  if (baseClasses.has(base)) {
    return baseClasses.get(base);
  }

  const clazz = class StatefulElement extends base {
    constructor() {
      super();
      if (this.getShadowTemplate())
        this.attachShadow({mode: 'open'});
    }

    getTemplate() {
      throw Error('`getTemplate` needs to be overwritten');
    }

    getShadowTemplate() {
      return null;
    }

    render(newState) {
      render(this.getTemplate(newState), this);
      if (this.getShadowTemplate())
          render(this.getShadowTemplate(newState), this.shadowRoot);
    }
  }
  baseClasses.set(base, clazz);
  return clazz;
}
