import Reddit from 'modules/Reddit';
import Config from 'modules/Config';

export default class ServiceWorkerController {
  constructor(event) {
    self.addEventListener('message', ::this.onMessage);
    self.addEventListener('fetch', ::this.onFetch);
    caches.open(Config.APP_CACHE)
      .then(cache => cache.addAll(Config.APP_FILES))
      .then(_ => {console.log('App has been cached offline')});
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
        event.respondWith(caches.match(event.request).then(cachedResponse => {
          const freshResponse = fetch(event.request).then(freshResponse => {
            if(freshResponse.status === 200) {
              return caches.open(Config.APP_CACHE)
                .then(cache => cache.put(event.request, freshResponse))
                .then(_ => freshResponse);
            }
            return freshResponse;
          });

          return cachedResponse?cachedResponse:freshResponse;
        }));
        break;
    }
  }
}
