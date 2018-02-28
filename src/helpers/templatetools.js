function isTemplate(e) {
  return e instanceof TemplateInstance;
}

export class Template {
  constructor(html, updateFunc = _ => {}) {
    this._tpl = document.createElement('template');
    this._tpl.innerHTML = html;
    this._updateFunc = updateFunc;
  }

  instantiate() {
    const instance = document.createElement('template-instance');
    instance.setUpdateFunction(this._updateFunc);
    instance.appendChild(this._tpl.content.cloneNode(true));
    instance.rescanParts();
    return instance;
  }

  instantiateTo(container, state) {
    let instance;
    if (isTemplate(container))
      instance = container;
    else if (isTemplate(container.firstChild))
      instance = container.firstChild;
    if (instance && instance.state.uid === state.uid) {
        instance.update(state);
        return instance;
    } else if (instance && instance.isHydratable) {
      // TODO
    } else {
      while (container.firstChild)
        container.firstChild.remove();
      const instance = this.instantiate();
      instance.update(state);
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

export function updateList(container, targetItems, itemFactory, idFunc = v => v.uid) {
  const existingItems = Array.from(container.children);
  const existingItemUidMap = existingItems.reduce((map, item) => Object.assign(map, {[idFunc(item.state)]: item}), {});
  const targetItemUidMap = targetItems.reduce((map, item) => Object.assign(map, {[idFunc(item)]: item}), {});

  const deletedItemIds = existingItems.map(item => idFunc(item.state)).filter(id => !(id in targetItemUidMap));
  deletedItemIds.forEach(item => item.remove());

  const targetItemIt = targetItems[Symbol.iterator]();
  const existingItemIt = existingItems[Symbol.iterator]();
  while (true) {
    const {value: existingItem} = existingItemIt.next();
    const {value: targetItem} = targetItemIt.next();
    if(!targetItem)
      break;
    if(existingItem && existingItem.state.uid === targetItem.uid) {
      container.appendChild(existingItem);
      continue;
    }
    if(targetItem.uid in existingItemUidMap) {
      container.appendChild(existingItem);
      continue;
    }
    const instance = itemFactory();
    instance.update(targetItem);
    container.appendChild(instance);
  }
}
export const html = String.raw;
