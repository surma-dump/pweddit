import Reddit from '/modules/Reddit.js';
import Imgur from '/modules/Imgur.js';
import Gfycat from '/modules/Gfycat.js';
import Gyazo from '/modules/Gyazo.js';
import ImageCatchall from '/modules/ImageCatchall.js';
import Config from '/modules/Config.js';
import SimpleCache from '/modules/SimpleCache.js';

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
      'zippy.gfycat.com': Gfycat,
      'gyazo.com': Gyazo,
      'i.gyazo.com': Gyazo
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

    // Special stuff for our origin
    if(self.location.origin === url.origin) {
      // Never look in cache for ServiceWorker file
      if(url.pathname === '/sw.js') {
        return event.respondWith(fetch(event.request));
      }

      return event.respondWith(
        caches.match(event.request).then(response =>
          response || new Response(null, {status: 404})
        )
      );
    }

    if(ImageCatchall.canHandle(url)) {
      return ImageCatchall.onFetch(event);
    }

    event.respondWith(
      caches.match(event.request).then(
        response => response || fetch(event.request)
      )
    );
  }
}
