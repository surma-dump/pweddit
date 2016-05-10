import Utils from 'modules/Utils';
import Router from 'modules/Router';

export default function() {
  if(typeof window._headerbar === 'undefined') {
    window._headerbar = new HeaderBar(document.querySelector('body > header'));
  }
  return window._headerbar;
}

class HeaderBar {
  constructor(node) {
    this.node = node;
    this.backButton = this.node.querySelector('.header__back');
    this.backButton.addEventListener('click', _ => this.back());
    this.refreshButton = this.node.querySelector('.header__refresh');
    this.refreshButton.addEventListener('click', _ => this.refresh());
    this.titleNode = this.node.querySelector('.header__title');
    this.defaultTitle = this.titleNode.textContent;
  }

  back() {
    window.history.back();
  }

  refresh() {
    return this.startSpinning()
      .then(_ => Router().currentView.refresh())
      .then(_ => this.stopSpinning());
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
    this.titleNode.classList.add('invisible');
    this.titleNode::Utils.transitionEndPromise()
      .then(_ => {
        this.titleNode.textContent = title;
        this.titleNode.classList.remove('invisible');
      });
  }
}
