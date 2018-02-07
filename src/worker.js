import {Comlink} from './comlink/comlink.es6.js';
import {default as injectEventHandler} from './comlink/event.transferhandler.js';
import {default as injectFunctionHandler} from './comlink/function.transferhandler.js';

import kittyImage from './images/kitty.jpg';

injectFunctionHandler(injectEventHandler(Comlink));

function genUID() {
  const arr = new Array(8).fill(0).map(_ => Math.floor(Math.random() * 256));
  return btoa(arr);
}

function openThread(id) {
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
        image: kittyImage,
        title: 'I stole this from Monica',
        author: 'Some random neckbeard',
        subreddit: 'webdev',
        date: '2018-01-01'
      },
      {
        uid: genUID(),
        type: 'thread-item',
        thread_id: 2,
        image: kittyImage,
        title: 'This author said JavaScript is call by reference.',
        author: 'Too_smart_for_you',
        subreddit: 'javascript',
        date: '2018-01-01'
      }
    ]
  },
  views: [ ]
};

(async _ => {
  const UI = Comlink.proxy(self);
  await UI.render(state);

  UI.addEventListener('navigate', async ev => {
    const pathItems = new URL(ev.detail).pathname.split('/').slice(1);
    switch (pathItems[0]) {
      case 'comments':
        openThread(pathItems[1]);
        await UI.render(state);
      break;
    }
  });

  const mainView = await UI.querySelector('main-view');
  mainView.addEventListener('top-view-dismiss', async ev => {
    state.views.pop();
    await UI.render(state);
  });
})();


