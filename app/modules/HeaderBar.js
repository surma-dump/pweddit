import Utils from 'modules/Utils';

export default function() {
  if(typeof window._headerbar === 'undefined') {
    window._headerbar = new HeaderBar(document.querySelector('body > header'));
  }
  return window._headerbar;
}

class HeaderBar {
  constructor(node) {
    this.node = node;
    this.node.querySelector('.header__back')
      .addEventListener('click', _ => window.history.back());
    this.titleNode = this.node.querySelector('.header__title');
    this.defaultTitle = this.titleNode.textContent;
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
