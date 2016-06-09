import Utils from '/modules/Utils.js';

export default function() {
  if (typeof window._router === 'undefined')
    window._router = new Router();
  return window._router;
}

class Router {
  constructor() {
    this.routes = {};
    this.currentView = null;
    this.transition = Promise.resolve();

    window.addEventListener('popstate', ::this.onPopState);
    this.manageState();
  }

  parseLocation(loc) {
    const path = loc.pathname.replace(/^\//, '');
    // Assume the first part of the path is the
    // verb we want to action, with the rest of the path
    // being the data to pass to the handler.
    const pathParts = path.split('/');
    let view = pathParts.shift();
    const data = pathParts.join('/');

    // Add a special case for the root.
    if (view === '')
      view = '_root';

    return [view, data];
  }

  add(path, state) {
    // Assume the first part of the path is the
    // verb we want to action, with the rest of the path
    // being the data to pass to the handler.
    const pathParts = path.split('/');
    const view = pathParts.shift();

    if (this.routes[view])
      throw `A handler already exists for the action "${view}"`;

    this.routes[view] = new state();
    return Utils.rAFPromise()
      .then(_ => this.manageState());
  }

  remove(path) {
    const pathParts = path.split('/');
    const view = pathParts.shift();

    delete this.routes[view];
  }

  manageState() {
    let [view, data] = this.parseLocation(document.location);
    const inView = this.routes[view];
    const outView = this.currentView;

    if (this.currentView === inView) {
      const currentView = this.currentView
      return this.transition = this.transition
                                .then(_ => currentView.update(data));
    }

    if (this.currentView && inView && !inView.options.keepPrevious) {
      this.transition = this.transition.then(_ => outView.out());
    }

    if (!inView) {
      this.currentView = null;
      return this.transition;
    }

    this.currentView = inView;
    if(!outView || !outView.options.keepPrevious)
      this.transition = this.transition.then(_ => inView.in(data));
    return this.transition;
  }

  go(path) {
    if (path === window.location.pathname)
      return this.transition;

    history.replaceState(document.scrollingElement.scrollTop, '', `${window.location.pathname}`);
    history.pushState(undefined, '', path);
    return this.transition
      .then(_ => Utils.rAFPromise())
      .then(_ => this.manageState());
  }

  onPopState(event) {
    event.preventDefault();
    this.transition
      .then(_ => Utils.rAFPromise())
      .then(_ => this.manageState())
      .then(_ => document.scrollingElement.scrollTop = event.state);
  }
}
