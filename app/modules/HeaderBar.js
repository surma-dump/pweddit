import Utils from '/modules/Utils.js';
import Template from '/modules/Template.js';
import Router from '/modules/Router.js';
import PwedditStore from '/modules/PwedditStore.js';

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
    this.notificationsNode = this.node.querySelector('.headerbar__drawer__notifications');
    this.drawerControlsNode = this.node.querySelector('.headerbar__drawer__controls');

    this.defaultTitle = this.titleNode.textContent;
    this.searchNode.style.cssText = '';
    this.containerNode.removeChild(this.searchNode);

    this.suggestionItem = new Template(o => `
      <div class="headerbar__drawer__suggestion" data-subreddit="${o.subreddit}">
        <button class="headerbar__drawer__suggestion__use">${o.subreddit}</button>
        <button class="button headerbar__drawer__suggestion__edit"></button>
        <button class="button headerbar__drawer__suggestion__delete"></button>
      </div>
    `);

    this.searchInputNode.addEventListener('keydown', ::this.searchKeyDown);
    this.backButton.addEventListener('click', _ => this.back());
    this.refreshButton.addEventListener('click', _ => this.refresh());
    this.titleNode.addEventListener('click', _ => this.showSearch());
    this.searchNode.addEventListener('submit', ::this.search);
    this.searchNode.querySelector('.headerbar__search__go')
      .addEventListener('click', _ => this.search());
    this.drawerNode.querySelector('.headerbar__drawer__icon').
      addEventListener('click', ::this.drawerClick);
    this.drawerControlsNode.addEventListener('click', ::this.drawerControlClick);

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
      .then(_ => {
        if(!this.searchInputNode.value)
          return Router().go('/');
        return Promise.all([
          Router().go(`/r/${this.searchInputNode.value}`),
          PwedditStore().incrementSubredditCounter(this.searchInputNode.value)
        ]);
      });
  }

  showSearch() {
    if(this.node.classList.contains('headerbar--searching'))
      return Promise.resolve();

    return PwedditStore().getRecentSubreddits()
      .then(recents => {
          this.oldDrawerControls = Array.from(this.drawerControlsNode.children);
          return this.setDrawerControls(
            ...recents
              .map(::this.suggestionItem.renderAsDOM)
              .map(o => o[0])
          );
      })
      .then(_ => {
        this.searchInputNode.value = '';
        this.node.classList.add('headerbar--searching')
        return Promise.all([
          this.node::Utils.transitionEndPromise(),
          this.expandDrawer()
        ])
      })
      .then(_ => {
        this.node.classList.remove('headerbar--searching');
        this.containerNode.replaceChild(this.searchNode, this.titleNode);
        return Utils.rAFPromise();
      })
      .then(_ => {
        this.node.classList.add('headerbar--searching');
        return this.node::Utils.transitionEndPromise();
      })
      .then(_ => this.searchInputNode.focus());
  }

  hideSearch() {
    if(!this.node.classList.contains('headerbar--searching'))
      return Promise.resolve();

      this.node.classList.remove('headerbar--searching')
      return Promise.all([
          this.node::Utils.transitionEndPromise(),
          this.contractDrawer()
        ])
        .then(_ => {
          if(this.oldDrawerControls) {
            this.setDrawerControls(...this.oldDrawerControls)
              .then(_ => this.oldDrawerControls = null);
          }
          this.node.classList.add('headerbar--searching')
          this.containerNode.replaceChild(this.titleNode, this.searchNode);
        })
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
        return this.titleNode::Utils.transitionEndPromise();
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
    this.drawerNode.classList.remove('headerbar__drawer--new-notifications');
    return this.drawerNode::Utils.transitionEndPromise();
  }

  contractDrawer() {
    if(!this.drawerNode.classList.contains('headerbar__drawer--expanded'))
      return Promise.resolve();
    this.drawerNode.classList.remove('headerbar__drawer--expanded');
    this.drawerNode.classList.remove('headerbar__drawer--new-notifications');
    return this.drawerNode::Utils.transitionEndPromise()
      .then(_ => this.clearNotifications());
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
    this.drawerNode.classList.remove('headerbar__drawer--hidden');
    return this.drawerNode::Utils.transitionEndPromise();
  }

  searchKeyDown(event) {
    if(event.keyCode === 27) // Escape
      this.hideSearch();
  }

  addNotification(node) {
    if(typeof node === 'string') {
      const newNode = document.createElement('div');
      newNode.classList.add('notification');
      newNode.innerText = node;
      node = newNode
    }
    this.notificationsNode.appendChild(node);
    this.drawerNode.classList.add('headerbar__drawer--new-notifications');
  }

  clearNotifications() {
    this.notificationsNode::Utils.removeAllChildren();
  }

  setDrawerControls(...nodes) {
    this.drawerControlsNode::Utils.removeAllChildren();
    if(nodes.length > 0)
      nodes.forEach(::this.drawerControlsNode.appendChild);
    return Promise.resolve();
  }

  drawerControlClick(event) {
    if(event.target.classList.contains('headerbar__drawer__suggestion__delete')) {
      PwedditStore().removeFromRecents(event.target.parentNode.dataset.subreddit);
      event.target.parentNode.parentNode.removeChild(event.target.parentNode);
      event.preventDefault()
      event.stopPropagation();
      return;
    }
    if(event.target.classList.contains('headerbar__drawer__suggestion__edit')) {
      this.searchInputNode.value = event.target.parentNode.dataset.subreddit;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if(event.target.classList.contains('headerbar__drawer__suggestion__use')) {
      this.searchInputNode.value = event.target.parentNode.dataset.subreddit;
      this.search();
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  }
}

export default function() {
  if (typeof window._headerbar === 'undefined')
    window._headerbar = new HeaderBar(document.querySelector('.headerbar'));
  return window._headerbar;
}
