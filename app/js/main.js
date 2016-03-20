import SubredditListController from 'SubredditListController';

// console
const srlc = new SubredditListController(document.querySelector('div'));
window.x = srlc;
srlc.subreddit = 'leagueoflegends';
