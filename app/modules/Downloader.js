import Utils from '/modules/Utils.js';
import PwedditStore from '/modules/PwedditStore.js';
import Reddit from '/modules/Reddit.js';

export default class Downloader {
  static startDownloader() {
    if(Utils.isMainThread() && Utils.supportsServiceWorker() && Utils.supportsBgSync()) {
      return navigator.serviceWorker.ready
        .then(swRegistration => swRegistration.sync.register('downloadThreads'))
        .catch(err => {
          console.error('Could not register for background sync:', err);
        })
    }
    console.error('Not implemented yet');
  }

  static downloadAll() {
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
            p = p.then(_ => this._downloadUrl(item));
            break;
        }
        return p.then(_ => this.downloadAll());
      });
  }

  static _extractLinks(comment) {
    let r = [];
    if(!!comment.body_html)
      r = /<a[^>]+href="([^"]+)"/g::Utils.allMatches(comment.body_html)
        .map(x => x[1]);

    if(comment.replies && comment.replies.data && comment.replies.data.children) {
      r = [
        ...r,
        ...comment.replies.data.children
          .map(::this._extractLinks)
      ];
    }
    return r;
  }

  static _downloadThread(item) {
    return Reddit.thread(item.subreddit, item.threadid, item.sorting, {fromNetwork: true})
      .then(thread =>
        thread.comments
        .map(::this._extractLinks)
        .map(url => PwedditStore().queuePushUrl(url))
      );
  }

  static _downloadUrl(item) {
  }

}
