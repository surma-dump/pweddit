import Router from 'modules/Router';
import View from 'modules/View';

import SubredditView from 'views/SubredditView';
import ThreadView from 'views/ThreadView';
import RootView from 'views/RootView';

Router().add('_root', RootView);
Router().add('r', SubredditView);
Router().add('thread', ThreadView);

import HeaderBar from 'modules/HeaderBar';
HeaderBar();

import LinkViewer from 'modules/LinkViewer';
import Imgur from 'modules/Imgur';
import Gfycat from 'modules/Gfycat';
LinkViewer().registerHandler(Imgur);
LinkViewer().registerHandler(Gfycat);
LinkViewer().registerHandler({
  canHandle: url => (/(www\.)?reddit\.com/i.test(url.host) || url.host === location.host)
                        && url.pathname.indexOf('/r/') === 0,
  handle: url => {
    const parts = url.pathname.split('/');
    if(parts.length == 3 || parts.length == 4)
      Router().go(`/r/${parts[2]}`);
    else if(parts.length == 5 || parts.length == 6 || parts.length == 7)
      Router().go(`/thread/${parts[2]}/${parts[4]}`);
    else
      console.log(`Unhandled reddit.com url: ${url.toString()}`);
    return Promise.resolve();
  }
});

import Lazyload from 'modules/Lazyload';
Lazyload();


if('serviceWorker' in navigator)
  navigator.serviceWorker.register('/sw.js', {scope: '/'});

console.info('Version {{pkg.version}}');
