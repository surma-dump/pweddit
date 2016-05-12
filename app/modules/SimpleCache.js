export default class SimpleCache {
  constructor(cacheName, opts) {
    this.options = Object.assign({
      checkResponseStatus: false
    }, opts);
    this.cacheName = cacheName;
  }

  onFetch(event) {
    event.respondWith(
      caches.open(this.cacheName).then(cache =>
        cache.match(event.request).then(cachedResponse => {
          const freshResponse = fetch(event.request).then(freshResponse => {
            if(!this.options.checkResponseStatus || freshResponse.ok)
              cache.put(event.request, freshResponse.clone());
            return freshResponse;
          });

          return cachedResponse?cachedResponse:freshResponse;
        })
      )
    );
  }
}
