import Utils from '/modules/Utils.js';
import SimpleCache from '/modules/SimpleCache.js';

const CACHE_NAME = 'gyazo';
const cache = new SimpleCache(CACHE_NAME, {
  cacheFirst: true
});

export default class Gyazo {
  static canHandle(url) {
    return ['gyazo.com', 'i.gyazo.com'].indexOf(url.host) !== -1;
  }

  static _sourceForUrl(url) {
    let src = '';
    if(url.hostname == 'i.gyazo.com')
      src = url.toString();
    else
      // FIXME: Detect correct file extension
      src = `https://i.gyazo.com${url.pathname}.png`;
    return src;
  }

  static loadContent(url, fetcher = fetch) {
    return fetcher(this._sourceForUrl(url));
  }

  static showContent(url) {
    const node = document.createElement('img');
    node.src = this._sourceForUrl(url);
    return Promise.resolve([node]);
  }

  static wipeCache() {
    return cache.wipe();
  }

  static onFetch(event) {
    cache.onFetch(event);
  }
}
