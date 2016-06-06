import Utils from '/modules/Utils.js';
import SimpleCache from '/modules/SimpleCache.js';

const CACHE_NAME = 'gfycat';
const cache = new SimpleCache(CACHE_NAME, {
  cacheFirst: true
});

export default class Gfycat {
  static get _contentHosts() {
    return [
      'zippy.gfycat.com',
      'giant.gfycat.com',
      'fat.gfycat.com'
    ];
  }
  static canHandle(url) {
    return [
      'gfycat.com',
      ...this._contentHosts
    ].indexOf(url.host) !== -1;
  }

  static _typeForSource(url) {
     return url.endsWith('.webm') ? 'video/webm' : 'video/mp4';
  }

  static _potentialSourcesForContent(url) {
    return this._contentHosts
      .map(host => `https://${host}${url.pathname}.${Utils.supportsWebm()?'webm':'mp4'}`);
  }

  // Currently, we have to try and load ALL resources. Using a <video> tag
  // to sniff out the existing source doesn’t work as it leaves a incomplete
  // response in the cache that will never get updated.
  static loadContent(url) {
    return Promise.all(
      this._potentialSourcesForContent(url)
        .map(source => fetch(source).catch(_ => {}))
    );
  }

  static _createVideoSource(url) {
    const node = document.createElement('source');
    node.src = url;
    node.type = this._typeForSource(url);
    return node;
  }

  static showContent(url) {
    const node = document.createElement('video');
    node.autoplay = true;
    node.loop = true;
    node.addEventListener('click', event => {
      node.paused ? node.play() : node.pause();
      event.preventDefault();
    });

    this._potentialSourcesForContent(url)
      .map(source => this._createVideoSource(source))
      .forEach(source => node.appendChild(source));
    return Promise.resolve([node]);
  }

  static wipeCache() {
    return cache.wipe();
  }

  static onFetch(event) {
    cache.onFetch(event);
  }
}
