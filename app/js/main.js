import SubredditListController from 'SubredditListController';

const srlc = new SubredditListController(document.querySelector('div'));
window.x = srlc;
srlc.subreddit = 'leagueoflegends';

import ServiceWorkerController from 'ServiceWorkerController';
ServiceWorkerController.test();
