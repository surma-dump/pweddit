import Router from 'modules/Router';
import View from 'modules/View';

import SubredditSelectView from 'views/SubredditSelectView';
import SubredditView from 'views/SubredditView';

Router().add('_root', SubredditSelectView);
Router().add('r', SubredditView);

navigator.serviceWorker.register('/sw.js');
