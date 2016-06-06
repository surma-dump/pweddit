import Utils from '/modules/Utils.js';
import SimpleCache from '/modules/SimpleCache.js';

const CACHE_NAME = 'imagecatchall';
const cache = new SimpleCache(CACHE_NAME, {
  cacheFirst: true
});

export default class ImageCatchall {
  static canHandle(url) {
    return /\.(jpg|jpeg|gif|png|webp)$/i.test(url.pathname);
  }

  static _sourcesForUrl(url) {
    const sources = [url];

    if(url.protocol === 'http:') {
      url.protocol = 'https:';
      nodes.push(url);
    }
    return sources;
  }

  static loadContent(url) {
    return Promise.all(this._sourcesForUrl(url)
      .map(url => fetch(url.toString())));
  }

  static showContent(url) {
    return this._sourcesForUrl(url)
      .map(url => {
        const n = document.createElement('img');
        img.src = url.toString();
        return n;
      });
  }

  static wipeCache() {
    return cache.wipe();
  }

  static onFetch(event) {
    cache.onFetch(event);
  }
}
