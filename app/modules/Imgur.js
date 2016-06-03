import Config from '/modules/Config.js';
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

  static _apiCall(url) {
    return fetch(url, {
      headers: {
        'Authorization': `Client-ID ${Config.IMGUR_CREDENTIALS.CLIENT_ID}`
      },
      mode: 'cors'
    });
  }

  static processItemData(item) {
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

  static nodeForItem(item) {
    if(!item.data.animated) {
      const node = document.createElement('img');
      node.src = item.data.link;
      return node;
    }
    const node = document.createElement('video');
    node.autoplay = true;
    node.loop = true;
    node.controls = true;
    node.preload = 'auto';
    node.type = item._pweddit.type;
    node.src = item.data.link;
    return node;
  }

  static contentItemsForAlbum(url) {
    const parts = url.pathname.split('/');
    const id = parts[parts.length - 1];

    return this._apiCall(`https://api.imgur.com/3/album/${id}`)
      .then(album => album.json())
      .then(album =>
        album.data.images.map(image => this.processItemData(image))
      );
  }

  static contentItemForImage(url) {
    const parts = url.pathname.split('/');
    const id = parts[parts.length - 1];

    return this._apiCall(`https://api.imgur.com/3/image/${id}`)
      .then(image => image.json())
      .then(image => [this.processItemData(image)]);
  }

  static contentItems(url) {
    if(url.pathname.indexOf('/a/') === 0
      || url.pathname.indexOf('/album/') === 0)
      return this.contentItemsForAlbum(url);

    if(url.pathname.indexOf('/gallery/') === 0)
      url.pathname = url.pathname.replace(/^\/gallery\//, '');

    url.host = 'i.imgur.com';
    url.pathname = url.pathname.replace(/\.[^.\/]*$/, '')
    return this.contentItemForImage(url)
  }

  static loadContent(url) {
    return this.contentItems(url)
      .then(items => Promise.all(items.map(item => fetch(item.data.link))));
  }

  static showContent(url) {
    return this.contentItems(url)
      .then(urls => urls.map(::this.nodeForItem))
      .then(urls => {
        if(urls.length == 1)
          return urls[0];
        return urls;
      });
  }

  static onFetch(event) {
    cache.onFetch(event);
  }
}
