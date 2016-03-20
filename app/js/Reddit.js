export default class Reddit {
  static get _apiBase() {
    return 'https://api.reddit.com';
  }
  static _apiCall(url) {
    return new Promise(resolve => {
      const cbName = `jsonp_${Math.floor(window.performance.now()*1000)}`
      const scriptNode = document.createElement('script');
      window[cbName] = function(v) {
        window[cbName] = null;
        document.head.removeChild(scriptNode);
        resolve(v);
      };

      url += ((url.indexOf('?') === -1)?'?':'&') + `&jsonp=${cbName}`;
      scriptNode.src = url;
      document.head.appendChild(scriptNode);
    });
  }

  static SubredditPosts(subreddit, sorting = 'top') {
    return this._apiCall(`${this._apiBase}/r/${subreddit}/${sorting}`)
      .then(data => data.data.children.map(post => post.data));
  }
}
