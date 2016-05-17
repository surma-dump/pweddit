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
LinkViewer().registerHandler(Imgur);
LinkViewer().registerHandler({
  canHandle: url =>  (url.host === 'reddit.com' || url.host === location.host)
                        && url.pathname.indexOf('/r/') === 0,
  handle: url => {
    Router().go(`/r/${url.pathname.split('/')[2]}`);
    return Promise.resolve();
  }
});

import Lazyload from 'modules/Lazyload';
Lazyload();


if('serviceWorker' in navigator)
  navigator.serviceWorker.register('/sw.js');

console.info('Version {{pkg.version}}');
