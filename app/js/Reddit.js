import Utils from './utils';


export default class Reddit {
  static get _apiBase() {
    return 'https://api.reddit.com';
  }

  static _apiCall(url) {
    return new Promise(resolve => {
      const cbName = `jsonp_${Math.floor(self.performance.now()*1000)}`
      url += ((url.indexOf('?') === -1)?'?':'&') + `jsonp=${cbName}`;

      let scriptNode;
      if(!Utils.isWorkerRuntime()) {
        scriptNode = document.createElement('script');
        scriptNode.src = url;
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
      } else {
        importScripts(url);
      }
    });
  }

  static subredditPosts(subreddit, sorting = 'top') {
    return this._apiCall(`${this._apiBase}/r/${subreddit}/${sorting}`)
      .then(data => data.data.children.map(post => post.data));
  }

  // Canonicalizes a URL, i.e. removes the `jsonp` search parameter
  static _canonicalURL(url) {
    const searchParams = new URLSearchParams(url.search.slice(1));
    searchParams.delete('jsonp');
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
          // If we have an answer cached, use that.
          if(cachedResponse) {
            return cachedResponse.text();
          }
          // Otherwise fetch the from the API and parse it,
          // store it in the cache and return that.
          return this._apiCall(canonicalURL)
            .then(data => JSON.stringify(data))
            .then(data => caches.open('reddit')
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
        .then(data => new Response(
          `/**/${callback}(${data});`,
          {url: url.toString()}
        ))
    );
  }
}
