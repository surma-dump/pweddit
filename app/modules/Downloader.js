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

  static _linksFromString(s) {
    return /<a[^>]+href="([^"]+)"/g::Utils.allMatches(s)
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
    return Reddit.thread(item.subreddit, item.threadid, item.sorting, {fromNetwork: true})
      .then(thread => [
        ...this._linksFromString(thread.post.selftext_html),
        ...thread.comments
          .reduce((prev, cur) => [...prev, ...this._linksFromComment(cur)], [])
      ]
        .map(url => PwedditStore().queuePushUrl(url))
      );
  }

  static _downloadUrl(item) {
    return Promise.resolve();
  }

}
