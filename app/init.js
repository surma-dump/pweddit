import Router from '/modules/Router.js';
import View from '/modules/View.js';

import SubredditView from '/views/SubredditView.js';
import ThreadView from '/views/ThreadView.js';
import RootView from '/views/RootView.js';
import LinkView from '/views/LinkView.js';

Router().add('_root', RootView);
Router().add('r', SubredditView);
Router().add('thread', ThreadView);
Router().add('external', LinkView);

import HeaderBar from '/modules/HeaderBar.js';
HeaderBar();

import Imgur from '/modules/Imgur.js';
import Gfycat from '/modules/Gfycat.js';
import Gyazo from '/modules/Gyazo.js';
import ImageCatchall from '/modules/ImageCatchall.js';
LinkView().registerHandler(Imgur);
LinkView().registerHandler(Gfycat);
LinkView().registerHandler(Gyazo);
LinkView().registerHandler(ImageCatchall);

import Lazyload from '/modules/Lazyload.js';
Lazyload();


if('serviceWorker' in navigator)
  navigator.serviceWorker.register('/sw.es5.js', {scope: '/'})
    .then(registration =>
      registration.onupdatefound = _ =>
        HeaderBar().addNotification('New version loaded. Refresh!'));

console.info('Version {{pkg.version}}');
