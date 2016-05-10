import Utils from 'modules/Utils';

export default function RouterInstance () {
  if (typeof window.RouterInstance_ === 'undefined')
    window.RouterInstance_ = new Router();
  return window.RouterInstance_;
}

class Router {

  constructor() {
    this.routes = {};
    this.currentAction = null;
    this.transition = Promise.resolve();

    window.addEventListener('popstate', e => {
      this.onPopState(e);
    });

    this.manageState();
  }

  add(path, state) {
    // Assume the first part of the path is the
    // verb we want to action, with the rest of the path
    // being the data to pass to the handler.
    const pathParts = path.split('/');
    const action = pathParts.shift();

    if (this.routes[action])
      throw `A handler already exists for the action "${action}"`;

    this.routes[action] = new state();
    requestAnimationFrame(_ => this.manageState());
  }

  remove(path) {
    const pathParts = path.split('/');
    const action = pathParts.shift();

    delete this.routes[action];
  }

  manageState() {
    const path = document.location.pathname.replace(/^\//, '');

    // Assume the first part of the path is the
    // verb we want to action, with the rest of the path
    // being the data to pass to the handler.
    const pathParts = path.split('/');
    let action = pathParts.shift();
    const data = pathParts.join('/');

    // Add a special case for the root.
    if (action === '')
      action = '_root';

    if (this.currentAction === this.routes[action]) {
      if (typeof this.currentAction.update === 'function') {
        this.transition = this.transition
          .then(_ => this.currentAction.update(data));
      }
      return this.transition;
    }

    if (this.currentAction) {
      const outAction = this.currentAction;
      return this.transition = this.transition.then(_ => outAction.out());
    }

    if (!this.routes[action]) {
      this.currentAction = null;
      document.body.focus();
      return this.transition;
    }

    const inAction = this.routes[action];
    this.currentAction = inAction;
    return this.transition = this.transition.then(_ => inAction.in(data));
  }

  go(path) {
    if (path === window.location.pathname)
      return this.transition;

    history.pushState(undefined, "", path);
    return this.transition = this.transition
      .then(_ => Utils.rAFPromise())
      .then(_ => ::this.manageState());
  }

  onPopState(e) {
    e.preventDefault();
    requestAnimationFrame(_ => ::this.manageState());
  }
}
