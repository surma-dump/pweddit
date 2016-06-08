import Utils from '/modules/Utils.js';
import HeaderBar from '/modules/HeaderBar.js';

export default class View {
  constructor(id) {
    this.node = document.createElement('section');
    this.node.id = id;
    this.node.classList.add('view')
    this.viewContainer = document.body;

    // TODO: Remove this
    this.node._view = this;
  }

  in(data) {
    const node = this.node;
    node.classList.add('transitioning', 'in');
    this.addView(node);
    return Utils.rAFPromise()
      .then(_ => HeaderBar().contractDrawer())
      .then(_ => Utils.rAFPromise())
      .then(_ => node.classList.remove('in'))
      .then(_ => node::Utils.transitionEndPromise())
      .then(_ => node.classList.remove('transitioning'));
  }

  out() {
    const node = this.node;
    node.classList.add('transitioning', 'out');
    return Promise.all([
      HeaderBar().contractDrawer(),
      node::Utils.transitionEndPromise()
    ])
    .then(_ => {
      HeaderBar().setDrawerControls();
      node.classList.remove('transitioning', 'out');
      this.viewContainer.removeChild(node);
    });
  }

  addView(node) {
    this.viewContainer.insertBefore(node, this.viewContainer.children[0]);
  }

  update(data) {
    return this.out()
      .then(_ => this.in(data));
  }

  refresh() {
    console.log('Not implemented');
    return Promise.resolve();
  }
}
