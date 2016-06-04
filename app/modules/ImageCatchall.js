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

  static handle(url) {
    const nodes = [];
    const node = document.createElement('img');
    node.src = url.toString();
    nodes.push(node);

    if(url.protocol === 'http:') {
      const node = document.createElement('img');
      url.protocol = 'https:';
      node.src = url.toString();
      nodes.push(node);
    }
    return nodes;
  }

  static onFetch(event) {
    cache.onFetch(event);
  }
}
