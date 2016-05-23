import Reddit from 'modules/Reddit';
import Imgur from 'modules/Imgur';
import Gfycat from 'modules/Gfycat';
import Config from 'modules/Config';
import SimpleCache from 'modules/SimpleCache';

export default class ServiceWorkerController {
  constructor() {
    this.fetchMap = {
      'api.reddit.com': Reddit,
      'a.thumbs.redditmedia.com': new SimpleCache('redditmedia', {cacheFirst: true}),
      'b.thumbs.redditmedia.com': new SimpleCache('redditmedia', {cacheFirst: true}),
      'imgur.com': Imgur,
      'api.imgur.com': Imgur,
      'i.imgur.com': Imgur,
      'm.imgur.com': Imgur,
      'gfycat.com': Gfycat,
      'giant.gfycat.com': Gfycat,
      'zippy.gfycat.com': Gfycat
    };

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

    if(url.host in this.fetchMap)
      return this.fetchMap[url.host].onFetch(event);

    // If this is our host, do 404 checks for SPA handling
    if(self.location.host === url.host) {
      // Never look in cache for ServiceWorker file
      if(url.pathname === '/sw.js') {
        return event.respondWith(fetch(event.request));
      }

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
}
