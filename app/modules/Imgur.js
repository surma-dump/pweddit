import Config from 'modules/Config';
import Utils from 'modules/Utils';
import SimpleCache from 'modules/SimpleCache';
import LinkViewer from 'modules/LinkViewer';

const CACHE_NAME = 'imgur';
const imgurCache = new SimpleCache(CACHE_NAME, {
  cacheFirst: true
});

export default class Imgur {
  static canHandle(url) {
    return ['imgur.com', 'i.imgur.com'].indexOf(url.host) !== -1;
  }

  static imageNode(url) {
    const node = document.createElement('img');
    node.src = url;
    return node;
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
        album.data.images.map(img => this.imageNode(img.link))
      );
  }

  static loadImage(url) {
    const parts = url.pathname.split('/');
    const id = parts[parts.length - 1];

    return this._apiCall(`https://api.imgur.com/3/image/${id}`)
      .then(album => album.json())
      .then(album => this.imageNode(album.data.link));
  }

  static handle(url) {
    switch(url.host) {
      case 'i.imgur.com':
        return Promise.resolve([this.imageNode(url.toString())]);
      case 'imgur.com':
        if(url.pathname.indexOf('/a/') === 0) {
          return this.loadAlbum(url);
        }
        url.host = 'i.imgur.com';
        return this.loadImage(url);
      default:
        const node = document.createElement('div');
        node.classList.add('error');
        node.textContent = `Imgur plugin can’t handle the link ${url.toString()}`;
        return Promise.resolve([node]);
    }
  }

  static register() {
    LinkViewer().registerHandler(Imgur);
  }

  static onFetch(event) {
    imgurCache.onFetch(event);
  }
}
