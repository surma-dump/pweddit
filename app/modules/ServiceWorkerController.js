import Reddit from '/modules/Reddit.js';
import ImageCatchall from '/modules/ImageCatchall.js';
import PwedditStore from '/modules/PwedditStore.js';
import Downloader from '/modules/Downloader.js';

export default class ServiceWorkerController {
  constructor() {
    self.addEventListener('message', ::this.onMessage);
    self.addEventListener('fetch', ::this.onFetch);
    self.addEventListener('sync', ::this.onSync);
    this.initPromise = caches.open({{{json config.APP_CACHE}}})
      .then(cache => cache.addAll({{{json config.APP_FILES}}}));
  }

  onMessage(msg) {
    console.log('Message received:', msg);
  }

  onFetch(event) {
    const url = new URL(event.request.url);

    if(Downloader.canHandle(url))
      return Downloader.onFetch(event);

    // Special stuff for our origin
    if(self.location.origin === url.origin) {
      // Never look in cache for ServiceWorker file
      if(url.pathname === '/sw.es5.js') {
        return event.respondWith(fetch(event.request));
      }

      // On cache-miss respond with index.html
      return event.respondWith(
        caches.match(event.request).then(
          response => response ||
            fetch(event.request).then(
              response => response.ok?response:caches.match('/')
            ).catch(_ => caches.match('/'))
        )
      );
    }

    event.respondWith(
      caches.match(event.request).then(
        response => response || fetch(event.request)
      )
    );
  }

  onSync(event) {
    console.log(`Sync ${event.tag}`)
    switch(event.tag) {
      case 'test-tag-from-devtools':
      case 'downloadAll':
        return event.waitUntil(
          Downloader.downloadAll((url, opts={}) =>
            new Promise(resolve =>
              Downloader.onFetch({
                request: new Request(url, opts),
                waitUntil: _ => {},
                respondWith: resolve
              })
            )
          )
          .catch(_ => {})
        );
    }
  }
}
