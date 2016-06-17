import Utils from '/modules/Utils.js';
import PwedditStore from '/modules/PwedditStore.js';
import Reddit from '/modules/Reddit.js';
import Imgur from '/modules/Imgur.js';
import Gfycat from '/modules/Gfycat.js';
import Gyazo from '/modules/Gyazo.js';
import RedditMedia from '/modules/RedditMedia.js';
import SimpleCache from '/modules/SimpleCache.js';
import ImageCatchall from '/modules/ImageCatchall.js';


const fetchMap = {
  'api.reddit.com': Reddit,
  'a.thumbs.redditmedia.com': RedditMedia,
  'b.thumbs.redditmedia.com': RedditMedia,
  'imgur.com': Imgur,
  'api.imgur.com': Imgur,
  'i.imgur.com': Imgur,
  'm.imgur.com': Imgur,
  'gfycat.com': Gfycat,
  'giant.gfycat.com': Gfycat,
  'zippy.gfycat.com': Gfycat,
  'gyazo.com': Gyazo,
  'i.gyazo.com': Gyazo
};

export default class Downloader {
  static startDownloader() {
    if(Utils.isMainThread() && Utils.supportsServiceWorker() && Utils.supportsBgSync()) {
      return navigator.serviceWorker.ready
        .then(swRegistration => swRegistration.sync.register('downloadAll'))
        .catch(err => {
          console.error('Could not register for background sync:', err);
        })
    }
    console.error('Not implemented yet');
  }

  static downloadAll(fetcher = fetch) {
    return PwedditStore().queuePop()
      .then(item => {
        let p = Promise.resolve();
        if(!item)
          return p;
        switch(item.type) {
          case 'thread':
            p = p.then(_ => this._downloadThread(item));
            break;
          case 'url':
            p = p.then(_ => this._downloadUrl(item, fetcher));
            break;
        }
        return p.then(_ => this.downloadAll(fetcher));
      });
  }

  static _linksFromString(s) {
    return /&lt;a.+?href="([^"]+)"/g::Utils.allMatches(s)
      .map(x => x[1]);

  }

  static _linksFromComment(comment) {
    let r = [];
    if(!!comment.body_html)
      r = this._linksFromString(comment.body_html);

    if(comment.replies && comment.replies.data && comment.replies.data.children) {
      comment.replies.data.children.forEach(c => r.push(...this._linksFromComment(c)))
    }
    return r;
  }

  static _downloadThread(item) {
    return Reddit.thread(item.subreddit, item.threadid, item.sorting, {fromNetwork: true, raw: true})
      .then(thread => {
        let urls = [
          thread.post.url,
          ...this._linksFromString(thread.post.selftext_html),
        ];
        thread.comments.forEach(c => urls.push(...this._linksFromComment(c)))
        return Promise.all(urls.map(url => PwedditStore().queuePushUrl(url)));
        }
      )
      .catch(_ => {});
  }

  static canHandle(url) {
    return url.host in fetchMap;
  }

  static _handlerForURL(url) {
    if(typeof url === 'string') {
      try {
        url = new URL(url);
      } catch(e) {
        return null;
      }
    }

    if(url.host in fetchMap) {
      const handler = fetchMap[url.host];
      if(handler.canHandle(url))
        return fetchMap[url.host];
    }

    if(ImageCatchall.canHandle(url))
      return ImageCatchall;

    return null;
  }

  static onFetch(event) {
    const handler = this._handlerForURL(event.request.url);
    if(handler)
      return handler.onFetch(event);
    return event.respondWith(fetch(event.request));
  }

  static _downloadUrl(item, fetcher = fetch) {
    try {
      item.url = new URL(item.url);
    } catch(e) {
      return Promise.resolve();
    }

    const handler = this._handlerForURL(item.url);
    if(!handler)
      return Promise.resolve();

    return handler.loadContent(item.url, fetcher)
      .catch(_ => {});
  }

}
