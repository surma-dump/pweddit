import '/comlink/comlink.global.min.js';
import '/comlink/event.transferhandler.js';
import '/comlink/function.transferhandler.js';
import {html, render} from '/lit/custom-lit.js';
import {StackView} from '/views/stack-view.js';
import {SideNav} from '/views/side-nav.js';
import {ViewA} from '/views/view-a.js';
import {ViewB} from '/views/view-b.js';

customElements.define('stack-view', StackView);
customElements.define('side-nav', SideNav);
customElements.define('view-a', ViewA);
customElements.define('view-b', ViewB);

async function init() {
  const app = Comlink.proxy(new Worker('worker.js'));
  setupEventListeners(app);
  await app.update();
}

function setupEventListeners(app) {
  document.addEventListener('top-view-dismiss', _ => {
    app.removeTopView();
  });

  document.addEventListener('add-view', ev => {
    app.addView(ev.detail);
  });

  app.addEventListener('view-model-change', ev => {
    const state = ev.detail;
    console.log(state);
    render(customElements.get(state.type).lightDom(state), document.body);
  });
}

init();
