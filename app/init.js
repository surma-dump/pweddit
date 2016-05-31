function loadAll(files) {
  return Promise.all(files.map(f => System.import(f)))
}

const routes = {
  '_root': _ => System.import('/views/RootView.js'),
  'r': _ => System.import('/views/SubredditView.js'),
  'thread': _ => System.import('/views/ThreadView.js'),
  'external': _ => loadAll([
                      '/views/LinkView.js',
                      '/modules/Imgur.js',
                      '/modules/Gfycat.js',
                      '/modules/Gyazo.js',
                      '/modules/ImageCatchall.js'
                    ])
                    .then(([LinkView, ...handlers]) => {
                      handlers.forEach(h => LinkView.default().registerHandler(h));
                      return LinkView;
                    })
};

// Load Router and Headerbar first.
// Use Router to figure out which view is needed first and only load that bit.
// After the first view has been loaded and slid into view, load the remaining
// views.
// Once that is done, register the service worker.
loadAll([
    '/modules/Router.js',
    '/modules/Headerbar.js'
  ])
  .then(([Router, Headerbar]) => {
    Headerbar.default();
    Router = Router.default;
    const [viewName] = Router().parseLocation(document.location);
    if(!(viewName in routes))
      return;

    routes[viewName]()
      .then(view => Router().add(viewName, view.default))
      .then(_ => {
        Object.keys(routes)
          .filter(v => v !== viewName)
          .forEach(v => routes[v]().then(view => Router().add(v, view.default)));
      })
      .then(_ => new Promise(resolve => {
        requestIdleCallback(resolve);
      }))
      .then(_ => {
        if('serviceWorker' in navigator)
          navigator.serviceWorker.register('/sw.es5.js', {scope: '/'})
            .then(registration =>
              registration.onupdatefound = _ =>
                HeaderBar().addNotification('New version loaded. Refresh!'));
      });
  });

import Lazyload from '/modules/Lazyload.js';
Lazyload();

console.info('Version {{pkg.version}}');
