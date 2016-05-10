import Router from 'modules/Router';
import View from 'modules/View';

import SubredditSelectView from 'views/SubredditSelectView';
import SubredditView from 'views/SubredditView';
import ThreadView from 'views/ThreadView';

Router().add('_root', SubredditSelectView);
Router().add('r', SubredditView);
Router().add('thread', ThreadView);

document.querySelector('.header__back')
  .addEventListener('click', _ => window.history.back());

navigator.serviceWorker.register('/sw.js');
