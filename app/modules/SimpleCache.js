export default class SimpleCache {
  constructor(cacheName, opts) {
    this.options = Object.assign({
      checkResponseStatus: false,
      cacheFirst: false
    }, opts);
    this.cacheName = cacheName;
  }

  onFetch(event) {
    event.respondWith(
      caches.open(this.cacheName).then(cache =>
        cache.match(event.request).then(cachedResponse => {
          if(this.options.cacheFirst && cachedResponse) {
            return cachedResponse;
          }
          const freshResponse = fetch(event.request).then(freshResponse => {
            if(!this.options.checkResponseStatus || freshResponse.ok)
              event.waitUntil(cache.put(event.request, freshResponse.clone()));
            return freshResponse;
          });

          return cachedResponse?cachedResponse:freshResponse;
        })
      )
    );
  }
}
