import Utils from 'modules/Utils';

export default class View {
  constructor(id) {
    this.node = document.createElement('section');
    this.node.id = id;
    this.node.classList.add('view')
    this.viewContainer = document.querySelector('#viewContainer');

    // For inspecting through DevTools
    this.node._view = this;
  }

  in(data) {
    const node = this.node;
    node.classList.add('invisible', 'in');
    this.viewContainer.appendChild(node);
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

  update(data) {
    return this.out()
      .then(_ => this.in(data));
  }
}
