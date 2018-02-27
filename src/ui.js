import EventTargetPolyfill from './helpers/event-target-polyfill.js';

export default class UI extends EventTargetPolyfill {
  constructor() {
    super();
    document.addEventListener('click', this._onClick.bind(this));
  }

  querySelector(s) {
    return Clooney.asRemoteValue(document.querySelector(s));
  }

  async render(state) {
    (await import('./fragments/main-view.js')).default.renderTo(state, document.body);
  }

  _onClick(ev) {
    if (ev.target.tagName === 'A') {
      ev.preventDefault();
      this.dispatchEvent(new CustomEvent('navigate', {detail: ev.target.href}));
    }
  }
}
