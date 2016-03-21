import SubredditListController from 'SubredditListController';

const srlc = new SubredditListController(document.querySelector('div'));
window.x = srlc;
srlc.subreddit = 'pics';

navigator.serviceWorker.register('/sw.js');
