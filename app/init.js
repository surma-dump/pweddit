function loadCSS(path) {
  return new Promise(resolve => {
    const node = document.createElement('link');
    node.rel = 'stylesheet';
    node.onload = resolve;
    node.onerror = resolve;
    node.href = path;
    document.head.appendChild(node);
  });
}

const routes = {
  '_root': _ =>
    Promise.all([
      System.import('/views/RootView.js'),
      loadCSS('/views/RootView.css')
    ]),
  'r': _ =>
    Promise.all([
      System.import('/views/SubredditView.js'),
      loadCSS('/views/SubredditViewItem.css')
    ]),
  'thread': _ =>
    Promise.all([
      System.import('/views/ThreadView.js'),
      loadCSS('/views/ThreadView.css')
    ]),
  'external': _ =>
    Promise.all([
      System.import('/views/LinkView.js'),
      loadCSS('/views/LinkView.css'),
      System.import('/modules/Imgur.js'),
      System.import('/modules/Gfycat.js'),
      System.import('/modules/Gyazo.js'),
      System.import('/modules/ImageCatchall.js')
    ])
    .then(([LinkView, _, ...handlers]) => {
      LinkView.default();
      handlers.forEach(h => LinkView.default().registerHandler(h.default));
      return [LinkView];
    })
};

// Load Router and Headerbar first.
// Use Router to figure out which view is needed first and only load that bit.
// After the first view has been loaded and slid into view, load the remaining
// views.
// Once that is done, register the service worker.
Promise.all([
    System.import('/modules/Router.js'),
    System.import('/modules/HeaderBar.js'),
    loadCSS('/modules/View.css'),
    loadCSS('/modules/HeaderBar.css')
  ])
  .then(([Router, HeaderBar]) => {
    HeaderBar.default();
    Router = Router.default;
    const [viewName] = Router().parseLocation(document.location);
    if(!(viewName in routes))
      return;

    routes[viewName]()
      .then(([view]) => Router().add(viewName, view.default))
      .then(_ =>  Object.keys(routes)
        .filter(v => v !== viewName)
        .forEach(v => routes[v]().then(([view]) => Router().add(v, view.default)))
      )
      .then(_ => new Promise(resolve => {
        requestIdleCallback(resolve);
      }))
      .then(_ => {
        if('serviceWorker' in navigator)
          navigator.serviceWorker.register('/sw.es5.js', {scope: '/'})
            .then(registration =>
              registration.onupdatefound = _ =>
                HeaderBar.default().addNotification('New version loaded. Refresh!'));
      });
  });

console.info('Version {{pkg.version}}');
