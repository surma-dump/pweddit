import EventTargetPolyfill from './helpers/event-target-polyfill.js';

export default class UiBridge extends EventTargetPolyfill {
  constructor() {
    super();
    document.addEventListener('click', this._onClick.bind(this));
  }

  whenDefined(elem) {
    return customElements.whenDefined(elem);
  }

  querySelector(s) {
    const r = document.querySelector(s);
    if(!r)
      return r
    return Clooney.asRemoteValue(r);
  }

  async render(state) {
    (await import('./fragments/pweddit-main-view.js')).default.renderTo(document.body, state);
  }

  _onClick(ev) {
    if (ev.target.tagName === 'A') {
      ev.preventDefault();
      this.dispatchEvent(new CustomEvent('navigate', {detail: ev.target.href}));
    }
  }
}
