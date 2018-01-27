import '/comlink.global.min.js';
import '/event.transferhandler.js';
import '/function.transferhandler.js';
import {render} from '/lit-html.js';
import * as streamtools from '/streamtools.js';
import {StackView} from '/stack-view.js';

async function init() {
  const app = Comlink.proxy(new Worker('worker.js'));
  setupEventListeners(app);
  const reader = streamtools.eventStream(app, 'view-model-change')
    .pipeThrough(streamtools.mapStream(ev => ev.detail))
    .pipeThrough(streamtools.logStream())
    .getReader();

  await app.update();

  while (true) {
    const {value, done} = await reader.read();
    if (done)
      return;
    render(StackView.LightDom(value), document.querySelector('main'));
  }
}
init();

function setupEventListeners(app) {
  document.addEventListener('top-view-dismiss', _ => {
    app.removeTopView()
  });
}
