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
LinkViewer();

import Lazyload from 'modules/Lazyload';
Lazyload();

import Imgur from 'modules/Imgur';
Imgur.register();

navigator.serviceWorker.register('/sw.js');
console.info('Version {{pkg.version}}');
