import Config from 'modules/Config';
import Utils from 'modules/Utils';
import SimpleCache from 'modules/SimpleCache';

const CACHE_NAME = 'imgur';
const cache = new SimpleCache(CACHE_NAME, {
  cacheFirst: true
});

export default class Imgur {
  static canHandle(url) {
    return ['imgur.com', 'i.imgur.com', 'm.imgur.com'].indexOf(url.host) !== -1;
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
        album.data.images.map(img => this.nodeForImage({data: img}))
      );
  }

  static createVideoSource(url, type) {
    const node = document.createElement('source');
    node.src = url;
    node.type = type;
    return node;
  }

  static nodeForImage(image) {
    if(!image.data.animated) {
      const node = document.createElement('img');
      node.src = image.data.link.replace('http://', 'https://');
      return node;
    }
    const node = document.createElement('video');
    node.appendChild(this.createVideoSource(image.data.webm.replace('http://', 'https://'), 'video/webm'));
    node.appendChild(this.createVideoSource(image.data.mp4.replace('http://', 'https://'), 'video/mp4'));
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
    if(url.pathname.indexOf('/a/') === 0
      || url.pathname.indexOf('/album/') === 0
      || url.pathname.indexOf('/gallery/') === 0) {
      return this.loadAlbum(url);
    }

    url.host = 'i.imgur.com';
    url.pathname = url.pathname.replace(/\.[^.\/]*$/, '')
    return this.loadImage(url);
  }

  static onFetch(event) {
    cache.onFetch(event);
  }
}
