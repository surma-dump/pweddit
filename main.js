import '/comlink.global.min.js';
import '/event.transferhandler.js';
import '/function.transferhandler.js';
import {html, render} from '/custom-lit.js';
import * as streamtools from '/streamtools.js';
import {StackView} from '/stack-view.js';
import {SideNav} from '/side-nav.js';
import {ViewA} from '/view-a.js';
import {ViewB} from '/view-b.js';

customElements.define(StackView.tag, StackView);
customElements.define(SideNav.tag, SideNav);
customElements.define(ViewA.tag, ViewA);
customElements.define(ViewB.tag, ViewB);

async function init() {
  const app = Comlink.proxy(new Worker('worker.js'));
  setupEventListeners(app);
  app.addEventListener('view-model-change', async ev => {
    const state = ev.detail;
    console.log(state);
    render(customElements.get(state.type).lightDom(state), document.body);
  });
  await app.update();
}
init();

function setupEventListeners(app) {
  document.addEventListener('top-view-dismiss', _ => {
    app.removeTopView();
  });

  document.addEventListener('add-view', ev => {
    app.addView(ev.detail);
  });
}

