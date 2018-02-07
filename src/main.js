import {Comlink} from './comlink/comlink.es6.js';
import {default as injectEventHandler} from './comlink/event.transferhandler.js';
import {default as injectFunctionHandler} from './comlink/function.transferhandler.js';
import EventTargetPolyfill from './helpers/event-target-polyfill.js';

injectFunctionHandler(injectEventHandler(Comlink));

[
  {tag: 'main-view', module: import('./fragments/main-view.js')},
  {tag: 'thread-item', module: import('./fragments/thread-item.js')},
  {tag: 'thread-view', module: import('./fragments/thread-view.js')},
  {tag: 'subreddit-view', module: import('./fragments/subreddit-view.js')},
  {tag: 'swipeable-sidenav', module: import('./components/swipeable-sidenav.js')}
]
  .map(async elem => customElements.define(elem.tag, (await elem.module).default));

const ui = new class extends EventTargetPolyfill {
  constructor() {
    super();
    document.addEventListener('click', this._onClick.bind(this));
  }

  querySelector(s) {
    return Comlink.proxyValue(document.querySelector(s));
  }

  async render(state) {
    const {render} = await import('./lit/custom-lit.js');
    render((await import('./fragments/main-view.js')).default.lightDom(state), document.body);
  }

  _onClick(ev) {
    if (ev.target.tagName === 'A') {
      ev.preventDefault();
      this.dispatchEvent(new CustomEvent('navigate', {detail: ev.target.href}));
    }
  }
}

// This is a workaround for Webpack.
const base = `${location.protocol}//${location.host}${location.pathname.split('/').slice(0, -1).join('/')}`;
Comlink.expose(ui, new Worker(`data:application/javascript,window=self;importScripts('${base}/comlink.js');importScripts('${base}/worker.js');`));
