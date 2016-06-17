import Utils from '/modules/Utils.js';
import SimpleCache from '/modules/SimpleCache.js';

const CACHE_NAME = 'imgur';
const cache = new SimpleCache(CACHE_NAME, {
  cacheFirst: true
});

export default class Imgur {
  static canHandle(url) {
    return ['imgur.com', 'i.imgur.com', 'm.imgur.com'].indexOf(url.host) !== -1;
  }

  static _apiCall(url, fetcher = fetch) {
    return fetcher(url, {
      headers: {
        'Authorization': `Client-ID {{config.IMGUR_CREDENTIALS.CLIENT_ID}}`
      },
      mode: 'cors'
    });
  }

  static _processItemData(item) {
    if(!item.data.animated) {
      item.data.link = item.data.link.replace('http://', 'https://');
      return item;
    }
    if('webm' in item.data) {
      item._pweddit = {type: 'video/webm'};
      item.data.link = item.data.webm.replace('http://', 'https://')
    } else if ('mp4' in item.data) {
      item._pweddit = {type: 'video/mp4'};
      item.data.link = item.data.mp4.replace('http://', 'https://')
    }
    return item;
  }

  static _nodeForItem(item) {
    if(!item.data.animated) {
      const node = document.createElement('img');
      node.src = item.data.link;
      return node;
    }
    const node = document.createElement('video');
    node.autoplay = true;
    node.loop = true;
    node.type = item._pweddit.type;
    node.src = item.data.link;
    node.addEventListener('click', event => {
      node.paused ? node.play() : node.pause();
      event.preventDefault();
    });
    return node;
  }

  static _contentItemsForAlbum(url, fetcher) {
    const parts = url.pathname.split('/');
    const id = parts[parts.length - 1];

    return this._apiCall(`https://api.imgur.com/3/album/${id}`, fetcher)
      .then(album => album.json())
      .then(album =>
        album.data.images.map(image => this._processItemData({data: image}))
      );
  }

  static _contentItemForImage(url, fetcher = fetch) {
    const parts = url.pathname.split('/');
    const id = parts[parts.length - 1];

    return this._apiCall(`https://api.imgur.com/3/image/${id}`)
      .then(image => image.json())
      .then(image => [this._processItemData(image)]);
  }

  static _contentItems(url, fetcher = fetch) {
    if(url.pathname.indexOf('/a/') === 0
      || url.pathname.indexOf('/album/') === 0)
      return this._contentItemsForAlbum(url, fetcher);

    if(url.pathname.indexOf('/gallery/') === 0)
      url.pathname = url.pathname.replace(/^\/gallery\//, '');

    url.host = 'i.imgur.com';
    url.pathname = url.pathname.replace(/\.[^.\/]*$/, '')
    return this._contentItemForImage(url, fetcher)
  }

  static loadContent(url, fetcher = fetch) {
    return this._contentItems(url, fetcher)
      .then(items => Promise.all(items.map(item => fetcher(item.data.link))));
  }

  static showContent(url) {
    return this._contentItems(url)
      .then(urls => urls.map(::this._nodeForItem))
      .then(urls => {
        if(urls.length == 1)
          return urls[0];
        return urls;
      });
  }

  static wipeCache() {
    return cache.wipe();
  }

  static onFetch(event) {
    cache.onFetch(event);
  }
}
