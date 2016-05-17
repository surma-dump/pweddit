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
    this.closeNode = this.node.querySelector('.linkviewer__close');
    this.countNode = this.node.querySelector('.linkviewer__details__count');
    this.textNode = this.node.querySelector('.linkviewer__details__text');

    this.externalLinkNode = new Template(`
      <a href="%url%" target="_blank" class="no-linkviewer">External link</a>
    `);

    this.forwardNode.addEventListener('click', _ => this.next());
    this.backwardNode.addEventListener('click', _ => this.previous());
    this.closeNode.addEventListener('click', _ => this.hide());

    document.addEventListener('click', ::this.globalClick);
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

  // Find the first handler that doesn’t return `null`
  contentForURL(url) {
    return Array.from(this.handlers.values())
      .filter(handler => handler.canHandle(url))
      .reduce((prev, handler) => prev || handler.handle(url), null) || Promise.resolve();
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
      .then(_ => this.node.classList.add('linkviewer--hidden'));
  }

  showLink(url) {
    if(!(url instanceof URL) && !(typeof url === 'string'))
      throw 'handleLink()) expects a URL or a string';
    if(typeof url === 'string')
      url = new URL(url);

    return this.contentForURL(url).then(content => {
      if(!content || content.length <= 0) {
        content = [this.externalLinkNode.renderAsDOM({url: url.toString()})[0]];
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
          this.textNode.innerText = '';
        });
    }
    return p.then(_ => {
      this.node.classList.add(inClass);
      this.containerNode.appendChild(this.content[this.index]);
      this.countNode.innerText = `${this.index+1}/${this.content.length}`;
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

  globalClick(event) {
    if(!(event.target instanceof Node))
      return;
    if(event.target.nodeName !== 'A')
      return;
    if(event.target.classList.contains('no-linkviewer'))
      return;
    if(event.target.href == '')
      return;

    let url;
    try {
      url = new URL(event.target.href);
    } catch(e) {
      return;
    }
    event.preventDefault();
    this.showLink(url);
  }
}
