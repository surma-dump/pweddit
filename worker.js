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
        uid: genUID(),
        type: 'thread-item',
        thread_id: 1,
        title: 'I stole this from Monica',
        author: 'Some random neckbeard',
        subreddit: 'webdev',
        date: '2018-01-01'
      },
      {
        uid: genUID(),
        type: 'thread-item',
        thread_id: 2,
        title: 'This author said JavaScript is call by reference.',
        author: 'Too_smart_for_you',
        subreddit: 'javascript',
        date: '2018-01-01'
      }
    ]
  },
  views: [ ]
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

  removeTopView() {
    state.views.pop();
    this.update();
  }

  openThread(id) {
    state.views.push({
      type: 'thread-view',
      title: 'Lol something else',
      author: 'dassurma',
      subreddit: 'pwa',
      date: '2018-01-01 yo:mama',
      post_text: 'Hey, I wanted to know: I’m 12 and what <em>is</em> this?',
      comments: [
        {
          author: 'PK',
          post_text: 'Dead powerful',
        },
        {
          author: 'aerotwist',
          post_text: 'Moany moan',
        }
      ]
    });
    this.update();
  }

  navigate(url) {
    url = new URL(url);
    const items = url.pathname.split('/').slice(1);
    switch(items[0].toLowerCase()) {
      case 'comments':
        this.openThread(items[1]);
      break;
    }
  }

  update() {
    viewmodel.dispatchEvent(new CustomEvent('view-model-change', {detail: state}));
  }
}
const viewmodel = new ViewModel();
Comlink.expose(viewmodel, self);

