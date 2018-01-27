import '/comlink.global.min.js';
import '/event.transferhandler.js';
import '/function.transferhandler.js';
import {render} from '/lit-html.js';
import * as streamtools from '/streamtools.js';
import {StackView} from '/stack-view.js';

async function init() {
  const app = Comlink.proxy(new Worker('worker.js'));
  setupEventListeners(app);
  app.addEventListener('view-model-change', async ev => {
    const state = ev.detail;
    console.log(state);
    render(StackView.lightDom(state), document.body);
  });
  await app.update();
}
init();

function setupEventListeners(app) {
  document.addEventListener('top-view-dismiss', _ => {
    app.removeTopView();
  });
}
