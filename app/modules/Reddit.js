import Utils from '/modules/Utils.js';

const CACHE_NAME = 'reddit';
const DEFAULT_OPTS = {
  fromNetwork: false,
  forceImport: false,
  raw: false
};

export default class Reddit {
  static get threadSortings() {
    return ['hot', 'new', 'top', 'controversial', 'rising'];
  }
  static get commentSortings() {
    return ['top', 'confidence', 'new', 'controversial', 'old', 'random', 'qa'];
  }
  static get _apiBase() {
    return 'https://api.reddit.com';
  }

  static canHandle(url) {
    return ['api.reddit.com', 'reddit.com'].indexOf(url.host) !== -1;
  }

  static _apiCall(url, opts = {}) {
    opts = Object.assign({}, DEFAULT_OPTS, opts);
    const cbName = `jsonp_${Math.floor(self.performance.now()*1000)}`
    url += ((url.indexOf('?') === -1)?'?':'&') + `jsonp=${cbName}`;
    url += `&_from_network=${opts.fromNetwork}&_raw=${opts.raw}`;

    return new Promise((resolve, reject) => {
      let scriptNode;
      if(!Utils.isWorkerRuntime()) {
        scriptNode = document.createElement('script');
        scriptNode.src = url;
        scriptNode.addEventListener('error', err => {
          if(!Utils.isWorkerRuntime()) {
            document.head.removeChild(scriptNode);
          }
          reject(err);
        });
      }

      self[cbName] = function(v) {
        self[cbName] = null;
        if(!Utils.isWorkerRuntime()) {
          document.head.removeChild(scriptNode);
        }
        resolve(v);
      };

      if(!Utils.isWorkerRuntime()) {
        document.head.appendChild(scriptNode);
      } else if(Utils.isWorkerRuntime() && !Utils.isServiceWorker() || opts.forceImport) {
        importScripts(url);
      } else if(Utils.isServiceWorker()) {
        this.onFetch({
          request: {url},
          waitUntil: _ => {},
          respondWith: resolve
        });
      }
    })
    .then(data => typeof data === 'object'?data:JSON.parse(data));
  }

  static subredditThreads(subreddit, sorting = 'hot', opts = {}) {
    return this._apiCall(`${this._apiBase}/r/${subreddit}/${sorting}`, opts)
      .then(data => data.data.children.map(post => post.data));
  }

  static thread(subreddit, id, sorting = 'top', opts = {}) {
    return this._apiCall(`${this._apiBase}/r/${subreddit}/comments/${id}/${sorting}`, opts)
      .then(data => ({
        post: data[0].data.children[0].data,
        comments: data[1].data.children.map(c => c.data)
      }));
  }

  static isThreadInCache(subreddit, id) {
    if(!('caches' in self)) {
      return Promise.resolve(false);
    }
    return caches.open(CACHE_NAME)
      .then(cache => Promise.all(
        this.commentSortings
          .map(sorting => `${this._apiBase}/r/${subreddit}/comments/${id}/${sorting}`)
          .map(url => cache.match(url))
        )
      )
      .then(matches =>
        matches
          .map(x => x !== undefined)
          .indexOf(true) !== -1
      );
  }

  static wipeCaches() {
    return Promise.all([
      caches.delete(CACHE_NAME),
      caches.delete('redditmedia')
    ]);
  }

  // Canonicalizes a URL, i.e. removes parameters that are pweddit specific
  static _canonicalURL(url) {
    const searchParams = new URLSearchParams(url.search.slice(1));
    searchParams.delete('jsonp');
    searchParams.delete('_from_network');
    searchParams.delete('_raw');
    url.search = '?' + searchParams.toString();
    return url.toString();
  }

  // Request to the Reddit JSONP API should return the same content
  // regardless of the `jsonp` search parameter.
  static onFetch(event) {
    const request = event.request;
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search.slice(1));
    const callback = searchParams.get('jsonp');
    const canonicalURL = this._canonicalURL(url);

    event.respondWith(
      caches.match(canonicalURL)
        .then(cachedResponse => {
          // If we have an answer cached and are not supposed to hit the
          // the network, use that.
          if(cachedResponse && searchParams.get('_from_network') !== 'true') {
            return cachedResponse.text();
          }

          // If we don’t have a response in cache and are not supposed
          // to hit the network, return 404.
          if(searchParams.get('_from_network') !== 'true') {
            return new Response(null, {
              status: 404,
              statusText: 'Not in cache'
            });
          }
          // If we don’t have a response in cache and are supposed
          // to hit the network, hit the network, duh,
          // and store it in the cache and return that.
          return this._apiCall(canonicalURL, {forceImport: true})
            .then(data => JSON.stringify(data))
            .then(data => caches.open(CACHE_NAME)
              .then(cache =>
                cache.put(
                  canonicalURL,
                  new Response(
                    data,
                    {url: canonicalURL}
                  )
                )
                .then(_ => data)
              )
            );
        })
        // Assemble a new response with the correct JSONP callback
        .then(data => {
          if(data instanceof Response)
            return data;
          if(searchParams.get('_raw') === 'true')
            return data;
          return new Response(
            `/**/${callback}(${data});`,
            {url: url.toString()}
          );
        })
    );
  }
}
