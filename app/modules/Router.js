import Utils from 'modules/Utils';

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

  add(path, state) {
    // Assume the first part of the path is the
    // verb we want to action, with the rest of the path
    // being the data to pass to the handler.
    const pathParts = path.split('/');
    const view = pathParts.shift();

    if (this.routes[view])
      throw `A handler already exists for the action "${view}"`;

    this.routes[view] = new state();
    requestAnimationFrame(_ => this.manageState());
  }

  remove(path) {
    const pathParts = path.split('/');
    const view = pathParts.shift();

    delete this.routes[view];
  }

  manageState() {
    const path = document.location.pathname.replace(/^\//, '');
    // Assume the first part of the path is the
    // verb we want to action, with the rest of the path
    // being the data to pass to the handler.
    const pathParts = path.split('/');
    let view = pathParts.shift();
    const data = pathParts.join('/');

    // Add a special case for the root.
    if (view === '')
      view = '_root';

    if (this.currentView === this.routes[view]) {
      const currentView = this.currentView
      return this.transition = this.transition
                                .then(_ => currentView.update(data));
    }

    if (this.currentView) {
      const outView = this.currentView;
      this.transition = this.transition.then(_ => outView.out());
    }

    if (!this.routes[view]) {
      this.currentView = null;
      document.body.focus();
      return this.transition;
    }

    const inView = this.routes[view];
    this.currentView = inView;
    return this.transition = this.transition.then(_ => inView.in(data));
  }

  go(path) {
    if (path === window.location.pathname)
      return this.transition;

    history.pushState(undefined, '', path);
    return this.transition
      .then(_ => Utils.rAFPromise())
      .then(_ => this.manageState());
  }

  onPopState(e) {
    e.preventDefault();
    this.transition
      .then(_ => Utils.rAFPromise())
      .then(_ => this.manageState());
  }
}
