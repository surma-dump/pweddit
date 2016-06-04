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

  static handle(url) {
    const node = document.createElement('img');
    node.src = `https://i.gyazo.com${url.pathname}.png`;
    return node;
  }

  static onFetch(event) {
    cache.onFetch(event);
  }
}
