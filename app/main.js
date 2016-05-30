import Router from 'modules/Router';
import View from 'modules/View';

import SubredditView from 'views/SubredditView';
import ThreadView from 'views/ThreadView';
import RootView from 'views/RootView';
import LinkView from 'views/LinkView';

Router().add('_root', RootView);
Router().add('r', SubredditView);
Router().add('thread', ThreadView);
Router().add('external', LinkView);

import HeaderBar from 'modules/HeaderBar';
HeaderBar();

import Imgur from 'modules/Imgur';
import Gfycat from 'modules/Gfycat';
import Gyazo from 'modules/Gyazo';
import ImageCatchall from 'modules/ImageCatchall';
LinkView().registerHandler(Imgur);
LinkView().registerHandler(Gfycat);
LinkView().registerHandler(Gyazo);
LinkView().registerHandler(ImageCatchall);

import Lazyload from 'modules/Lazyload';
Lazyload();


if('serviceWorker' in navigator)
  navigator.serviceWorker.register('/sw.js', {scope: '/'})
    .then(registration =>
      registration.onupdatefound = _ =>
        HeaderBar().addNotification('New version loaded. Refresh!'));

console.info('Version {{pkg.version}}');
