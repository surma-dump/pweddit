function isTemplate(e) {
  return e instanceof TemplateInstance;
}

export class Template {
  constructor(html) {
    this._tpl = document.createElement('template');
    this._tpl.innerHTML = html;
  }

  instantiate(container, updateFunc) {
    let instance;
    if (isTemplate(container))
      instance = container;
    else if (isTemplate(container.firstChild))
      instance = container.firstChild;
    if (instance && instance.state.id === state.id) {
        return instance;
    } else if (instance && instance.isHydratable) {
      // TODO
    } else {
      while (container.firstChild)
        container.firstChild.remove();
      const instance = document.createElement('template-instance');
      instance.appendChild(this._tpl.content.cloneNode(true));
      instance.rescanParts();
      instance.setUpdateFunction(updateFunc);
      container.appendChild(instance);
      return instance;
    }
  }
}

export class TemplateInstance extends HTMLElement {
  constructor() {
    super();
    this._parts = {};
    this._updateF = _ => {};
    this._state = {};
  }

  connectedCallback() {
    this.style.display = 'contents';
  }

  rescanParts() {
    this._parts = Array.from(this.querySelectorAll('[part-id]'))
      .reduce((parts, part) => Object.assign(parts, {[part.getAttribute('part-id')]: part}), {});
  }

  setUpdateFunction(updateF) {
    this._updateF = updateF;
  }

  update(state) {
    this._updateF(this, state, this._state);
    this._state = state;
  }

  get state() {
    return this._state;
  }

  part(name) {
    return this._parts[name];
  }

  get isHydratable() {
    return this.hasAttribute('hydratable');
  }
}
customElements.define('template-instance', TemplateInstance);

export const html = String.raw;
