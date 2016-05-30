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
    this.refreshButton = this.node.querySelector('.headerbar__refresh');
    this.titleNode = this.node.querySelector('.headerbar__title');
    this.containerNode = this.node.querySelector('.headerbar__container');
    this.searchNode = this.node.querySelector('.headerbar__search');
    this.searchInputNode = this.searchNode.querySelector('input');
    this.drawerNode = this.node.querySelector('.headerbar__drawer');

    this.defaultTitle = this.titleNode.textContent;
    this.searchNode.style.cssText = '';
    this.containerNode.removeChild(this.searchNode);

    this.searchInputNode.addEventListener('keydown', ::this.searchKeyDown);
    this.backButton.addEventListener('click', _ => this.back());
    this.refreshButton.addEventListener('click', _ => this.refresh());
    this.titleNode.addEventListener('click', _ => this.showSearch());
    this.searchNode.addEventListener('submit', ::this.search);
    this.searchNode.querySelector('.headerbar__search__go')
      .addEventListener('click', _ => this.search());
    this.drawerNode.addEventListener('click', ::this.drawerClick);

    this.node.classList.remove('headerbar--uninitialized');
  }

  back() {
    if(this.node.classList.contains('headerbar--searching')) {
      this.hideSearch();
      return;
    }
    window.history.back();
  }

  refresh() {
    return this.startSpinning()
      .then(_ => Router().currentView.refresh())
      .then(_ => this.stopSpinning());
  }

  search(e) {
    if(e)
      e.preventDefault();
    return this.hideSearch()
      .then(_ => Router().go(`/r/${this.searchInputNode.value}`));
  }

  showSearch() {
    if(this.node.classList.contains('headerbar--searching'))
      return Promise.resolve();

    this.node.classList.add('headerbar--searching')
    this.searchInputNode.value = '';
    return this.node::Utils.transitionEndPromise()
      .then(_ => {
        this.node.classList.remove('headerbar--searching')
        this.containerNode.replaceChild(this.searchNode, this.titleNode);
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
          this.containerNode.replaceChild(this.titleNode, this.searchNode);
        })
        .then(_ => Utils.rAFPromise())
        .then(_ => Utils.rAFPromise())
        .then(_ => this.node.classList.remove('headerbar--searching'))
        .then(_ => this.node::Utils.transitionEndPromise());
  }

  startSpinning() {
    this.refreshButton.classList.add('headerbar__refresh--spinning');
    return Promise.resolve()
  }

  stopSpinning() {
    return this.refreshButton::Utils.animationIterationPromise()
      .then(_ => this.refreshButton.classList.remove('headerbar__refresh--spinning'));
  }

  setTitle(title) {
    if(!title) {
      title = this.defaultTitle;
    }
    if(this.titleNode.textContent === title) {
      return Promise.resolve();
    }
    this.titleNode.classList.add('headerbar__title--changing');
    return this.titleNode::Utils.transitionEndPromise()
      .then(_ => {
        this.titleNode.textContent = title;
        this.titleNode.classList.remove('headerbar__title--changing');
      });
  }

  drawerClick() {
    if(this.drawerNode.classList.contains('headerbar__drawer--expanded'))
      return this.contractDrawer();
    return this.expandDrawer();
  }

  expandDrawer() {
    if(this.drawerNode.classList.contains('headerbar__drawer--expanded'))
      return Promise.resolve();
    this.drawerNode.classList.add('headerbar__drawer--expanded');
    return this.drawerNode::Utils.transitionEndPromise();
  }

  contractDrawer() {
    if(!this.drawerNode.classList.contains('headerbar__drawer--expanded'))
      return Promise.resolve();
    this.drawerNode.classList.remove('headerbar__drawer--expanded');
    return this.drawerNode::Utils.transitionEndPromise();
  }

  hideDrawer() {
    if(this.drawerNode.classList.contains('headerbar__drawer--hidden'))
      return Promise.resolve();
    this.drawerNode.classList.add('headerbar__drawer--hidden');
    return this.drawerNode::Utils.transitionEndPromise();
  }

  showDrawer() {
    if(!this.drawerNode.classList.contains('headerbar__drawer--hidden'))
      return Promise.resolve();
    this.drawerNode.classList.remove('headerbar__drawer--hidden', 'headerbar__drawer--new-notifications');
    return this.drawerNode::Utils.transitionEndPromise();
  }

  searchKeyDown(event) {
    if(event.keyCode === 27) // Escape
      this.hideSearch();
  }

  addNotification(text) {
    const node = document.createElement('div');
    node.classList.add('notification');
    node.innerText = text;
    this.drawerNode.appendChild(node);
    this.drawerNode.classList.add('headerbar__drawer--new-notifications');
  }
}
