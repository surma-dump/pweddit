importScripts('/comlink/comlink.global.js');
importScripts('/eventtargetmixin.js');

Comlink.transferHandlers.set('EVENT', eventTransferHandler);

class StateManager extends EventTargetMixin(class {}) {
  constructor() {
    super();
    this.state = {};
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
    this.dispatchEvent(new CustomEvent('state-change', {detail: this.state}));
  }
};

const stateMgr = new StateManager();
stateMgr.state = {
  currentState: {
    title: 'Pweddit',
    type: 'stack',
    stacks: [
      {
        type: 'subscriptions',
        reddits: [
          {
            name: 'all',
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
          {
            name: 'leagueoflegends',
            threads: [
              {
                title: 'New champ',
                permalink: '/thread/lol',
              },
              {
                title: 'Stop flaming',
                permalink: '/thread/lol',
              },
              {
                title: 'Irelia nerfed lol',
                permalink: '/thread/lol',
              },
            ],
          },
        ],
      },
    ],
  },
  targetState: null,
  nextState: null,
};

const dummyData = new Map([
  [
    'thread',
    {
      type: 'thread',
      title: 'Some thread',
      text: 'Let’s do a thing',
      comments: [
        {author: 'user 1', comment: 'ohai, have you seen <a href="/subreddit/lol">/r/lol</a>?'},
        {author: 'user 2', comment: 'desudesudesu'},
        {author: 'user 3', comment: 'top kek'},
        {author: 'user 4', comment: 'no'},
      ],
    },
  ],
  [
    'subreddit',
    {
      type: 'subreddit',
      name: 'webdev',
      threads: [
        {
          title: 'Using brainfuck on the web using wasm',
          permalink: '/thread/lol',
        },
        {
          title: 'Twitter now uses backbone',
          permalink: '/thread/lol',
        },
        {
          title: 'jQuery still popular',
          permalink: '/thread/lol',
        },
      ],
    },
  ],
]);

// lol
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

async function pushStack(type, params) {
  const nextState = deepCopy(stateMgr.state.targetState || stateMgr.state.currentState);
  nextState.stacks.push(dummyData.get(type));
  await stateMgr.mutateState(state => Object.assign(state, {nextState}));
}

async function popStack() {
  const nextState = deepCopy(stateMgr.state.targetState || stateMgr.state.currentState);
  nextState.stacks.pop();
  await stateMgr.mutateState(state => Object.assign(state, {nextState}));
}

Comlink.expose({
  stateMgr: Comlink.proxyValue(stateMgr),
  pushStack,
  popStack,
}, self);
