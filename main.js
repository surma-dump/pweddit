import '/comlink/comlink.global.min.js';
import '/comlink/event.transferhandler.js';
import '/comlink/function.transferhandler.js';
import {html, render} from '/lit/custom-lit.js';
import MainView from '/views/main-view.js';
import SubredditView from '/views/subreddit-view.js';
import ThreadItem from '/views/thread-item.js';
import ThreadView from '/views/thread-view.js';
import SwipeableSidenav from '/components/swipeable-sidenav.js';

customElements.define('main-view', MainView);
customElements.define('thread-item', ThreadItem);
customElements.define('thread-view', ThreadView);
customElements.define('subreddit-view', SubredditView);
customElements.define('swipeable-sidenav', SwipeableSidenav);

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
    render(MainView.lightDom(state), document.body);
  });

  document.addEventListener('click', ev => {
    if (ev.target.tagName !== 'A') return;

    ev.preventDefault();
    app.navigate(ev.target.href);
  });
}

init();
