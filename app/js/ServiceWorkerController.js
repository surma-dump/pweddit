import Reddit from 'js/Reddit';

export default class ServiceWorkerController {
  constructor() {
    self.addEventListener('message', ::this.onMessage);
    self.addEventListener('fetch', ::this.onFetch);
  }

  onMessage(msg) {
    console.log('Message received:', msg);
  }

  onFetch(event) {
    const url = new URL(event.request.url);
    switch(url.host) {
      case 'api.reddit.com':
        Reddit.onFetch(event);
        break;
      default:
        event.respondWith(fetch(event.request));
        break;
    }
  }
}
