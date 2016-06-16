import Utils from '/modules/Utils.js';
import SimpleCache from '/modules/SimpleCache.js';

const CACHE_NAME = 'redditmedia';
const cache = new SimpleCache(CACHE_NAME, {
  cacheFirst: true
});

export default class RedditMedia {
  static canHandle(url) {
    return ['a.thumbs.redditmedia.com', 'b.thumbs.redditmedia.com'].indexOf(url.host) !== -1;
  }

  static wipeCache() {
    return cache.wipe();
  }

  static onFetch(event) {
    cache.onFetch(event);
  }
}
