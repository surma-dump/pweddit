import '/comlink/comlink.global.min.js';
import '/comlink/event.transferhandler.js';
import '/comlink/function.transferhandler.js';
import {html, render} from '/lit/custom-lit.js';
import MainView from '/views/main-view.js';
import SubredditView from '/views/subreddit-view.js';
import ThreadItem from '/views/thread-item.js';
import ThreadView from '/views/thread-view.js';
import SwipeableSidenav from '/components/swipeable-sidenav.js';
  import EventTargetPolyfill from '/helpers/event-target-polyfill.js';

customElements.define('main-view', MainView);
customElements.define('thread-item', ThreadItem);
customElements.define('thread-view', ThreadView);
customElements.define('subreddit-view', SubredditView);
customElements.define('swipeable-sidenav', SwipeableSidenav);

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
