import {html, render} from '/lit-html/lit-html.js';
import {repeat} from '/lit-html/lib/repeat.js';
import {StatefulGroup} from '/stateful-element.js';
import '/comlink/comlink.global.js';
import '/eventtargetmixin.js';

const subredditTemplate = state => html`
  ${repeat(state.threads, i => html`
    <div><a href="${i.permalink}">${i.title}</a></div>
  `)}
`;

const threadTemplate = state => html`
  <h1>${state.title}</h1>
  <div>${state.text}</div>
  ${repeat(state.comments, i => html`
    <div>${i.author}: ${i.comment}</div>
  `)}
`;

const templateByType = {
  'subreddit': subredditTemplate,
  'thread': threadTemplate,
};

const mainTemplate = state => html`
  <header>
    ${state.title}
  </header>
  <view-switcher>
    ${repeat(state.panels, i => html`
      <div class="panel ${state.visibility}">
        ${templateByType[i.type](i)}
      </div>
    `)}
  </view-switcher>
`;

const worker = new Worker('/worker.js');
const p = Comlink.proxy(worker);

async function update() {
  render(mainTemplate(await p.stateMgr.state), document.body);
}

p.stateMgr.addEventListener('state-change', Comlink.eventListener(update))

async function mutateState(f) {
  await p.stateMgr.mutateState(Comlink.proxyValue(f));
}

function stateChange(f) {
  return p.stateMgr.stateChange(Comlink.proxyValue(f));
}

function transitionEnd(elem) {
  return new Promise(resolve => {
    elem.addEventListener('transitionend', function l(ev) {
      if (ev.target !== elem) return;
      elem.removeEventListener('transitionend', l);
      resolve();
    });
  });
}

document.body.addEventListener('transitionend', async ev => {
  if (!ev.target.classList.contains('panel')) return;
  await mutateState(state => {
    switch(state.visibility) {
      case 'transitioning-out':
        state.visibility = 'invisible';
        break;
      case 'transitioning-in':
        state.visibility = 'visible';
        break;
    }
    return state;
  });
});

document.addEventListener('click', async event => {
  if (event.target.nodeName !== 'A') return;
  event.preventDefault();

  await p.transitionTo(event.target.href);
  await stateChange(state => state.visibility === 'visible');
})

mutateState(state => {
  state.title = 'Pweddit — Initialized';
  return state;
});


