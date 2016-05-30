import Utils from '/modules/Utils.js';

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
    node.classList.add('invisible', 'in');
    this.addView(node);
    return Utils.rAFPromise()
      .then(_ => Utils.rAFPromise())
      .then(_ => node.classList.remove('invisible'))
      .then(_ => node::Utils.transitionEndPromise())
      .then(_ => node.classList.remove('in'));
  }

  out() {
    const node = this.node;
    node.classList.add('invisible', 'out');
    return node::Utils.transitionEndPromise()
      .then(_ => {
        node.classList.remove('invisible', 'out');
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
