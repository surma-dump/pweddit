import Utils from 'modules/Utils';

export default class View {
  constructor(id) {
    this.node = document.createElement('section');
    this.node.id = id;
    this.node.classList.add('view')
    this.viewContainer = document.querySelector('#viewContainer');
  }

  in(data) {
    const node = this.node;
    node.classList.add('invisible');
    this.viewContainer.appendChild(node);
    return Utils.rAFPromise()
      .then(_ => Utils.rAFPromise())
      .then(_ => node.classList.remove('invisible'))
      .then(_ => node::Utils.transitionEndPromise());
  }

  out() {
    const node = this.node;
    node.classList.add('invisible');
    return node::Utils.transitionEndPromise()
      .then(_ => {
        this.viewContainer.removeChild(node);
      });
  }

  update(data) {
    return this.out()
      .then(_ => this.in(data));
  }
}
