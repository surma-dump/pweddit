importScripts('/comlink/comlink.global.min.js');
importScripts('/comlink/event.transferhandler.js');
importScripts('/comlink/function.transferhandler.js');

function genUID() {
  const arr = new Array(8).fill(0).map(_ => Math.floor(Math.random() * 256));
  return btoa(arr);
}

const state = {
  root: {
    type: 'subreddit-view',
    subreddit: 'frontpage',
    threads: [
      {
        type: 'thread-item',
        title: 'I stole this from Monica',
        author: 'Some random neckbeard',
        subreddit: 'webdev',
        date: '2018-01-01'
      },
      {
        type: 'thread-item',
        title: 'This author said JavaScript is call by reference.',
        author: 'Too_smart_for_you',
        subreddit: 'javascript',
        date: '2018-01-01'
      }
    ]
  },
  items: [
    // {
    //   uid: genUID(),
    //   type: 'view-b',
    //   title: 'stack 2',
    //   skipAnimation: true
    // },
    // {
    //   uid: genUID(),
    //   type: 'view-a',
    //   title: 'stack 3',
    //   skipAnimation: true
    // }
  ]
};

const {port1} = new MessageChannel();
class ViewModel {
  postMessage(msg) {
    port1.postMessage(msg);
  }

  addEventListener(name, f) {
    port1.addEventListener(name, f);
  }

  dispatchEvent(ev) {
    port1.dispatchEvent(ev);
  }

  addView(view) {
    state.items.push(Object.assign(view, {uid: genUID()}));
    this.update();
  }

  removeTopView() {
    state.items.pop();
    this.update();
  }

  update() {
    viewmodel.dispatchEvent(new CustomEvent('view-model-change', {detail: state}));
  }
}
const viewmodel = new ViewModel();
Comlink.expose(viewmodel, self);

