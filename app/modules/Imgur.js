import Config from 'modules/Config';
import Utils from 'modules/Utils';
import SimpleCache from 'modules/SimpleCache';

const CACHE_NAME = 'imgur';
const imgurCache = new SimpleCache(CACHE_NAME, {
  cacheFirst: true
});

export default class Imgur {
  static canHandle(url) {
    return ['imgur.com', 'i.imgur.com'].indexOf(url.host) !== -1;
  }

  static _apiCall(url) {
    return fetch(url, {
      headers: {
        'Authorization': `Client-ID ${Config.IMGUR_CREDENTIALS.CLIENT_ID}`
      },
      mode: 'cors'
    });
  }

  static loadAlbum(url) {
    const parts = url.pathname.split('/');
    const id = parts[parts.length - 1];

    return this._apiCall(`https://api.imgur.com/3/album/${id}`)
      .then(album => album.json())
      .then(album =>
        album.data.images.map(img => this.nodeForImage(img.link))
      );
  }

  static nodeForImage(image) {
    if(!image.data.animated) {
      const node = document.createElement('img');
      node.src = image.data.link;
      return node;
    }
    const node = document.createElement('video');
    if(node.canPlayType('video/webm; codecs="vp8, vorbis"'))
      node.src = image.data.webm;
    else
      node.src = image.data.mp4;
    node.autoplay = true;
    node.loop = true;
    return node;
  }

  static loadImage(url) {
    const parts = url.pathname.split('/');
    const id = parts[parts.length - 1];

    return this._apiCall(`https://api.imgur.com/3/image/${id}`)
      .then(image => image.json())
      .then(image => this.nodeForImage(image));
  }

  static handle(url) {
    if(url.pathname.indexOf('/a/') === 0) {
      return this.loadAlbum(url);
    }
    url.host = 'i.imgur.com';
    url.pathname = url.pathname.replace(/\.[^.\/]*$/, '')
    return this.loadImage(url);
  }

  static onFetch(event) {
    imgurCache.onFetch(event);
  }
}
