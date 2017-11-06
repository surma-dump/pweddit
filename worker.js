importScripts('/comlink/comlink.global.js');
importScripts('/eventtargetmixin.js');

Comlink.transferHandlers.set('EVENT', eventTransferHandler);

class StateManager extends EventTargetMixin(class {}) {
  constructor() {
    super();
    this.state = {};
  }

  async addParamlessEventListener(name, f) {
    this.addEventListener(name, _ => f());
  }

  stateChange(f) {
    return new Promise(resolve => {
      this.addEventListener('state-change', async function l(ev) {
        if (!await f(this.state)) return;
        this.removeEventListener('state-change', l);
        resolve();
      }.bind(this));
    });
  }

  async mutateState(f) {
    this.state = await f(this.state);
    this.dispatchEvent(new CustomEvent('state-change'));
  }
};

const stateMgr = new StateManager();
stateMgr.state = {
  locked: false,
  title: 'Pweddit',
  visibility: 'visible',
  panels: [
    {
      type: 'subreddit',
      threads: [
        {
          title: 'Why your mom is not smart',
          permalink: '/thread/lol',
        },
        {
          title: 'LPT: Eat your veggies',
          permalink: '/thread/lol',
        },
        {
          title: 'How can mirrors be real if our eyes aren’t real?',
          permalink: '/thread/lol',
        },
      ],
    },
    // {
    //   id: 'lol2',
    //   title: 'Panel 2',
    // },
  ],
};

async function transitionTo(href) {
  await stateMgr.mutateState(state => {
    state.visibility = 'transitioning-out';
    return state;
  });
  await stateMgr.stateChange(state => state.visibility === 'invisible');
  await stateMgr.mutateState(state => {
    state.panels[0] =     state.panels[0] = {
      type: 'thread',
      title: 'Some thread',
      text: 'Let’s do a thing',
      comments: [
        {author: 'user 1', comment: 'ohai'},
        {author: 'user 2', comment: 'desudesudesu'},
        {author: 'user 3', comment: 'top kek'},
        {author: 'user 4', comment: 'no'},
      ],
    };
    return state;
  });
  await stateMgr.mutateState(state => {
    state.visibility = 'transitioning-in';
    return state;
  });
}

async function transitionEnd(event) {
  if (!event.targetClassList.includes('panel')) return;
  await stateMgr.mutateState(state => {
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
}

Comlink.expose({
  stateMgr: Comlink.proxyValue(stateMgr),
  transitionTo,
  transitionEnd,
}, self);
