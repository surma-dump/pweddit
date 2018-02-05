import '/comlink/comlink.global.min.js';
import '/comlink/event.transferhandler.js';
import '/comlink/function.transferhandler.js';
import {html, render} from '/lit/custom-lit.js';
import EventTargetPolyfill from '/helpers/event-target-polyfill.js';

[
  'views/main-view',
  'views/thread-item',
  'views/thread-view',
  'views/subreddit-view',
  'components/swipeable-sidenav'
]
  .map(async item => {
    const tag = item.split('/')[1];
    const module = await import(`${item}.js`);
    customElements.define(tag, module.default);
  });

const ui = new class extends EventTargetPolyfill {
  constructor() {
    super();
    document.addEventListener('click', this._onClick.bind(this));
  }

  querySelector(s) {
    return Comlink.proxyValue(document.querySelector(s));
  }

  render(state) {
    render(MainView.lightDom(state), document.body);
  }

  _onClick(ev) {
    if (ev.target.tagName === 'A') {
      ev.preventDefault();
      this.dispatchEvent(new CustomEvent('navigate', {detail: ev.target.href}));
    }
  }
}

Comlink.expose(ui, new Worker('worker.js'));
