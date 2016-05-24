import Utils from 'modules/Utils';
import SimpleCache from 'modules/SimpleCache';

const CACHE_NAME = 'gfycat';
const gfycatCache = new SimpleCache(CACHE_NAME, {
  cacheFirst: true
});

export default class Gfycat {
  static canHandle(url) {
    return [
      'gfycat.com',
      'giant.gfycat.com',
      'zippy.gfycat.com',
      'fat.gfycat.com'
    ].indexOf(url.host) !== -1;
  }

  static createVideoSource(url, type) {
    const node = document.createElement('source');
    node.src = url;
    node.type = type;
    return node;
  }

  static handle(url) {
    const node = document.createElement('video');
    node.appendChild(this.createVideoSource(`https://giant.gfycat.com${url.pathname}.webm`, 'video/webm'));
    node.appendChild(this.createVideoSource(`https://giant.gfycat.com${url.pathname}.mp4`, 'video/mp4'));
    node.appendChild(this.createVideoSource(`https://zippy.gfycat.com${url.pathname}.webm`, 'video/webm'));
    node.appendChild(this.createVideoSource(`https://zippy.gfycat.com${url.pathname}.mp4`, 'video/mp4'));
    node.appendChild(this.createVideoSource(`https://fat.gfycat.com${url.pathname}.webm`, 'video/webm'));
    node.autoplay = true;
    node.loop = true;
    return Promise.resolve([node]);
  }

  static onFetch(event) {
    gfycatCache.onFetch(event);
  }
}
