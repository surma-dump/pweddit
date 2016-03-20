const isWorker = !!self.importScripts;

export default class Reddit {
  static get _apiBase() {
    return 'https://api.reddit.com';
  }

  static _apiCall(url) {
    return new Promise(resolve => {
      const cbName = `jsonp_${Math.floor(self.performance.now()*1000)}`
      url += ((url.indexOf('?') === -1)?'?':'&') + `&jsonp=${cbName}`;

      let scriptNode;
      if(!isWorker) {
        scriptNode = document.createElement('script');
        scriptNode.src = url;
      }

      self[cbName] = function(v) {
        self[cbName] = null;
        if(!isWorker) {
          document.head.removeChild(scriptNode);
        }
        resolve(v);
      };

      if(!isWorker) {
        document.head.appendChild(scriptNode);
      } else {
        importScripts(url);
      }
    });
  }

  static SubredditPosts(subreddit, sorting = 'top') {
    return this._apiCall(`${this._apiBase}/r/${subreddit}/${sorting}`)
      .then(data => data.data.children.map(post => post.data));
  }
}
