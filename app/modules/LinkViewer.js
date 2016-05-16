import Template from 'modules/Template';
import Utils from 'modules/Utils';

export default function() {
  if(typeof window._linkViewer === 'undefined')
    window._linkViewer = new LinkViewer(document.querySelector('.linkviewer'));
  return window._linkViewer;
}

class LinkViewer {
  constructor(node) {
    this.handlers = new Set();
    this.node = node;
    this.containerNode = this.node.querySelector('.linkviewer__container');
    this.forwardNode = this.node.querySelector('.linkviewer__forward');
    this.backwardNode = this.node.querySelector('.linkviewer__backward');

    this.externalLinkNode = new Template(`
      <a href="%url%">External link</a>
    `);

    this.forwardNode.addEventListener('click', _ => this.next());
    this.backwardNode.addEventListener('click', _ => this.previous());
  }

  registerHandler(handler) {
    this.handlers.add(handler);
  }

  set content(val) {
    if(!(val instanceof Array)) {
      val = [val];
    }
    this.node.classList.toggle('linkviewer--single', val.length <= 1);
    this._content = val;
  }

  get content() {
    return this._content || [];
  }

  set index(val) {
    let outClass, inClass;
    if(val > this._index)
      [outClass, inClass] = ['linkviewer--left', 'linkviewer--right'];
    else
      [outClass, inClass] = ['linkviewer--right', 'linkviewer--left'];
    this._index = val;
    this.updateView(outClass, inClass);
  }

  get index() {
    return this._index || 0;
  }

  contentForURL(url) {
    return Array.from(this.handlers.values())
      .filter(handler => handler.canHandle(url))
      // Find the first handler that doesn’t return `null`
      .reduce((prev, handler) => prev || handler.handle(url), null);
  }

  show() {
    this.node.classList.remove('linkviewer--hidden');
    return Utils.rAFPromise()
      .then(_ => Utils.rAFPromise())
      .then(_ => this.node.classList.add('linkviewer--visible'))
      .then(_ => this.node::Utils.transitionEndPromise());
  }

  hide() {
    this.node.classList.remove('linkviewer--visible')
    return this.node::Utils.transitionEndPromise()
      .then(_ => this.node.classList.remove('linkviewer--hidden'));
  }

  showLink(url) {
    if(!(url instanceof URL) && !(typeof url === 'string'))
      throw 'handleLink()) expects a URL or a string';
    if(typeof url === 'string')
      url = new URL(url);

    return this.contentForURL(url).then(content => {
      if(!content || content.length <= 0) {
        content = [this.externalLinkNode.renderAsDOM({url})[0]];
      }
      this.content = content;
      this.index = 0;
      return this.show();
    });
  }

  updateView(outClass, inClass) {
    let p = Promise.resolve();
    if(this.containerNode.children.length > 0) {
      p = p.then(_ => this.node.classList.add(outClass))
        .then(_ => this.node::Utils.transitionEndPromise())
        .then(_ => {
          this.containerNode.removeChild(this.containerNode.children[0]);
          this.node.classList.remove(outClass);
        });
    }
    return p.then(_ => {
      this.node.classList.add(inClass);
      this.containerNode.appendChild(this.content[this.index]);
    })
      .then(_ => Utils.rAFPromise())
      .then(_ => Utils.rAFPromise())
      .then(_ => this.node.classList.remove(inClass))
      .then(_ => this.node::Utils.transitionEndPromise());
  }

  next() {
    if(this._index == this.content.length - 1)
      return;
    this._index = this._index + 1;
    this.updateView('linkviewer--left', 'linkviewer--right');
  }

  previous() {
    if(this._index == 0)
      return;
    this._index = this._index - 1;
    this.updateView('linkviewer--left', 'linkviewer--right');

  }
}
