import {html, render} from '/lit-html/lit-html.js';
import {repeat} from '/lit-html/lib/repeat.js';
import {transitionEndPromise, requestAnimationFramePromise} from '/helper.js';
import '/comlink/comlink.global.js';
import '/eventtargetmixin.js';
import '/pweddit-stack.js';
import '/pweddit-slider.js';

Comlink.transferHandlers.set('EVENT', eventTransferHandler);

const viewByType = new Map([
  [
    'subreddit', {
      prerender: async (oldState, newState) => {},
      template: state => html`
        <div class="subreddit">
        <h1>/r/${i.name}</h1>
        ${repeat(state.threads, i => html`
          <div><a href="${i.permalink}">${i.title}</a></div>
        `)}
        </div>
      `,
      postrender: async (oldState, newState) => {},
    },
  ],
  [
    'thread', {
      prerender: async (oldState, newState) => {},
      template: state => html`
        <div class="thread">
          <h1>${state.title}</h1>
          <div>${state.text}</div>
          ${repeat(state.comments, i => html`
            <div>${i.author}: ${i.comment}</div>
          `)}
        </div>
      `,
      postrender: async (oldState, newState) => {},
    },
  ],
  [
    'subscriptions', {
      prerender: async (oldState, newState) => {},
      template: state => html`
        <pweddit-slider>
          ${repeat(state.reddits, i => html`
            <div class="subscription">
              <h1>/r/${i.name}</h1>
              ${repeat(i.threads, j => html`<div class="thread"><a href="${j.permalink}">${j.title}</a></div>`)}
            </div>
          `)}
        </pweddit-slider>
      `,
      postrender: async (oldState, newState) => {},
    },
  ],
  [
    'stack', {
      prerender: async (oldState, newState) => {
        if (newState.stacks.length < oldState.stacks.length)
          await document.querySelector('pweddit-stack').slideOut();
      },
      template: state => html`
        <pweddit-stack>
          ${repeat(state.stacks, i => html`${viewByType.get(i.type).template(i)}`)}
        </pweddit-stack>
      `,
      postrender: async (oldState, newState) => {
        if (newState.stacks.length > oldState.stacks.length)
          await document.querySelector('pweddit-stack').slideIn();
      },
    },
  ],
  [
    'main', {
      prerender: async (oldState, newState) => {
        await viewByType.get(oldState.type).prerender(oldState, newState);
      },
      template: state => html`
        <header>
          <a href="#back" class="back">⬅️</a> ${state.title}
        </header>
        ${viewByType.get(state.type).template(state)}
      `,
      postrender: async (oldState, newState) => {
        await viewByType.get(newState.type).postrender(oldState, newState);
      },
    },
  ],
]);

const worker = new Worker('/worker.js');
const p = Comlink.proxy(worker);

async function update(ev) {
  const state = ev.detail;
  console.log('Update', state);
  if (!state)
    return;
  if (state.nextState && !state.targetState) {
    mutateState(state => Object.assign(state, {targetState: state.nextState, nextState: null}));
    return;
  }
  if (state.targetState) {
    await viewByType.get('main').prerender(state.currentState, state.targetState);
    render(viewByType.get('main').template(state.targetState), document.body);
    await viewByType.get('main').postrender(state.currentState, state.targetState);
    await mutateState(state => Object.assign(state, {currentState: state.targetState, targetState: null}));
  }
}

p.stateMgr.addEventListener('state-change', Comlink.proxyValue(update));

document.addEventListener('click', async event => {
  if (event.target.nodeName !== 'A') return;
  event.preventDefault();

  const link = new URL(event.target.href);
  if (link.hash === '#back')
    return await p.popStack();
  const type = link.pathname.split('/')[1];
  return await p.pushStack(type);
});

async function mutateState(f) {
  await p.stateMgr.mutateState(Comlink.proxyValue(f));
}

function stateChange(f) {
  return p.stateMgr.stateChange(Comlink.proxyValue(f));
}

mutateState(state => {
  state.nextState = Object.assign({}, state.currentState, {title: 'Pweddit — Initialized'});;
  return state;
});
