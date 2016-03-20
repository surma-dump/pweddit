import Reddit from 'js/Reddit';

export default class ServiceWorkerController {
  constructor() {
    self.addEventListener('message', ::this.onMessage);
    self.addEventListener('fetch', ::this.onFetch);
  }

  onMessage(msg) {
    console.log('Message received');
    Reddit.SubredditPosts(msg.data.subreddit).then(posts => {
      console.log(posts);
    });
  }

  onFetch() {
    console.log('Fetching');
  }
}
