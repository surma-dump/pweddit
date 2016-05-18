import Reddit from 'modules/Reddit';
import Imgur from 'modules/Imgur';
import Gfycat from 'modules/Gfycat';
import Config from 'modules/Config';
import SimpleCache from 'modules/SimpleCache';

export default class ServiceWorkerController {
  constructor() {
    this.fetchMap = {
      'api.reddit.com': Reddit,
      'a.thumbs.redditmedia.com': new SimpleCache('redditmedia'),
      'b.thumbs.redditmedia.com': new SimpleCache('redditmedia'),
      'imgur.com': Imgur,
      'api.imgur.com': Imgur,
      'i.imgur.com': Imgur,
      'gfycat.com': Gfycat,
      'giant.gfycat.com': Gfycat
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
    // Never look in cache for ServiceWorker file
    if(url.pathname === '/sw.js') {
      return event.respondWith(fetch(event.request));
    }

    if(url.host in this.fetchMap) {
      this.fetchMap[url.host].onFetch(event);
      return;
    }

    event.respondWith(
      caches.match(event.request.clone()).then(
        response => response || fetch(event.request)
      )
    );
  }
}
