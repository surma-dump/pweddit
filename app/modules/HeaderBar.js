import Utils from 'modules/Utils';
import Router from 'modules/Router';

export default function() {
  if(typeof window._headerbar === 'undefined') {
    window._headerbar = new HeaderBar(document.querySelector('.headerbar'));
  }
  return window._headerbar;
}

class HeaderBar {
  constructor(node) {
    this.node = node;
    this.backButton = this.node.querySelector('.headerbar__back');
    this.backButton.addEventListener('click', _ => this.back());
    this.refreshButton = this.node.querySelector('.headerbar__refresh');
    this.refreshButton.addEventListener('click', _ => this.refresh());
    this.titleNode = this.node.querySelector('.headerbar__title');
    this.titleNode.addEventListener('click', _ => this.showSearch());
    this.defaultTitle = this.titleNode.textContent;
    this.searchNode = this.node.querySelector('.headerbar__search');
    this.searchNode.style = '';
    this.searchNode.addEventListener('submit', ::this.search);
    this.searchInputNode = this.searchNode.querySelector('input');
    this.node.removeChild(this.searchNode);
  }

  back() {
    window.history.back();
  }

  refresh() {
    return this.startSpinning()
      .then(_ => Router().currentView.refresh())
      .then(_ => this.stopSpinning());
  }

  search(e) {
    e.preventDefault();
    return this.hideSearch()
      .then(_ => Router().go(`/r/${this.searchInputNode.value}`));
  }

  showSearch() {
    if(this.node.classList.contains('headerbar--searching'))
      return Promise.resolve();

    this.node.classList.add('headerbar--searching')
    return this.node::Utils.transitionEndPromise()
      .then(_ => {
        this.node.classList.remove('headerbar--searching')
        this.node.replaceChild(this.searchNode, this.titleNode);
      })
      .then(_ => Utils.rAFPromise())
      .then(_ => Utils.rAFPromise())
      .then(_ => this.node.classList.add('headerbar--searching'))
      .then(_ => this.node::Utils.transitionEndPromise())
      .then(_ => this.searchInputNode.focus());
  }

  hideSearch() {
    if(!this.node.classList.contains('headerbar--searching'))
      return Promise.resolve();

      this.node.classList.remove('headerbar--searching')
      return this.node::Utils.transitionEndPromise()
        .then(_ => {
          this.node.classList.add('headerbar--searching')
          this.node.replaceChild(this.titleNode, this.searchNode);
        })
        .then(_ => Utils.rAFPromise())
        .then(_ => Utils.rAFPromise())
        .then(_ => this.node.classList.remove('headerbar--searching'))
        .then(_ => this.node::Utils.transitionEndPromise());
  }

  startSpinning() {
    this.refreshButton.classList.add('spinning');
    return Promise.resolve()
  }

  stopSpinning() {
    return this.refreshButton::Utils.animationIterationPromise()
      .then(_ => this.refreshButton.classList.remove('spinning'));
  }

  setTitle(title) {
    if(!title) {
      title = this.defaultTitle;
    }
    if(this.titleNode.textContent === title) {
      return;
    }
    this.titleNode.classList.add('headerbar__title--changing');
    this.titleNode::Utils.transitionEndPromise()
      .then(_ => {
        this.titleNode.textContent = title;
        this.titleNode.classList.remove('headerbar__title--changing');
      });
  }
}
