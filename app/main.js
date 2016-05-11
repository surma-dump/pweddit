import Router from 'modules/Router';
import View from 'modules/View';

import SubredditSelectView from 'views/SubredditSelectView';
import SubredditView from 'views/SubredditView';
import ThreadView from 'views/ThreadView';
import RootView from 'views/RootView';

Router().add('_root', RootView);
Router().add('r', SubredditView);
Router().add('thread', ThreadView);

import HeaderBar from 'modules/HeaderBar';
HeaderBar();

navigator.serviceWorker.register('/sw.js');

console.info('Version {{pkg.version}}');
