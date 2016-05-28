import Router from 'modules/Router';
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

    this.externalLinkNode = new Template(o => `
      <div class="external">
        <a href="${o.url}" target="_blank" class="no-linkviewer">External link</a>
        <p>${o.url}</p>
      </div>
    `);

    this.forwardNode.addEventListener('click', _ => this.next());
    this.backwardNode.addEventListener('click', _ => this.previous());
    this.closeNode.addEventListener('click', _ => history.back());
    this.containerNode.addEventListener('touchstart', ::this.onTouchStart);
    this.containerNode.addEventListener('touchmove', ::this.onTouchMove);
    this.containerNode.addEventListener('touchend', ::this.onTouchEnd);

    document.addEventListener('click', ::this.globalClick);
    document.addEventListener('keydown', ::this.globalKeyDown);
  }

  registerHandler(handler) {
    this.handlers.add(handler);
  }

  set content(val) {
    if(!(val instanceof Array)) {
      val = [val];
    }
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
    return Promise.resolve(
      Array.from(this.handlers.values())
        .filter(handler => handler.canHandle(url))
        .reduce((prev, handler) => prev || handler.handle(url), null)
      ||
        [this.externalLinkNode.renderAsDOM({url: url.toString()})[0]]
      );
  }

  in(data) {
    this.url = data;
    return this.showLink(this.url);
  }

  out() {
    return this.hide();
  }

  update(data) {
    if(this.url === data)
      return;
    return this.out()
      .then(_ => this.in(data));
  }

  show() {
    this.node.classList.remove('linkviewer--hidden');
    return Utils.rAFPromise()
      .then(_ => Utils.rAFPromise())
      .then(_ => this.node.classList.add('linkviewer--visible'))
      .then(_ => this.node::Utils.transitionEndPromise())
      .then(_ => this.node.focus());
  }

  hide() {
    this.node.classList.remove('linkviewer--visible');
    return this.node::Utils.transitionEndPromise()
      .then(_ => {
        this.node.classList.add('linkviewer--hidden');
        this.containerNode.removeChild(this.containerNode.children[0]);
      });
  }

  loadLink(url) {
    if(!(url instanceof URL) && !(typeof url === 'string'))
      throw 'loadLink()) expects a URL or a string';
    if(typeof url === 'string')
      url = new URL(url);
    return this.contentForURL(url);
  }

  showLink(url) {
    return this.loadLink(url).then(content => {
      if(!content || content.length <= 0) {
        return Promise.resolve();
      }
      this.content = content;
      this.index = 0;
      return this.show();
    });
  }

  updateView(outClass, inClass) {
    this.node.classList.toggle('linkviewer--first', this.isFirst());
    this.node.classList.toggle('linkviewer--last', this.isLast());
    this.node.classList.add('linkviewer--animating');
    let p = Utils.rAFPromise()
      .then(_ => Utils.rAFPromise())

    if(this.containerNode.children.length > 0) {
      p = p.then(_ => {
          this.containerNode.children[0].style.transform = '';
          this.node.classList.add(outClass);
          return this.node::Utils.transitionEndPromise();
        })
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
      .then(_ => this.node::Utils.transitionEndPromise())
      .then(_ => this.node.classList.remove('linkviewer--animating'));
  }

  isFirst() {
    return this._index === 0;
  }

  isLast() {
    return this._index === this.content.length - 1;
  }

  next() {
    if(this.isLast())
      return;
    this._index = this._index + 1;
    this.updateView('linkviewer--left', 'linkviewer--right');
  }

  previous() {
    if(this.isFirst())
      return;
    this._index = this._index - 1;
    this.updateView('linkviewer--right', 'linkviewer--left');
  }

  globalClick(event) {
    if(!(event.target instanceof Node))
      return;
    let node = event.target;
    while(node && node.nodeName !== 'A')
      node = node.parentNode;
    if(!node)
      return;
    if(node.classList.contains('no-linkviewer'))
      return;
    if(node.href == '')
      return;

    let url;
    try {
      url = new URL(node.href);
    } catch(e) {
      return;
    }
    event.preventDefault();
    Router().go(`/external/${url}`);
    // this.showLink(url);
  }

  globalKeyDown(event) {
    if(!this.node.classList.contains('linkviewer--visible'))
      return;
    if(event.keyCode === 27) // Escape
        history.back();
    if(event.keyCode === 37) // Arrow left
      this.previous();
    if(event.keyCode === 39) // Arrow right
      this.next();
  }

  onTouchStart(event) {
    if(this.node.classList.contains('linkviewer--animating'))
      return;
    this.startPosition = event.touches[0];
    this.deltaX = 0;
  }

  onTouchMove(event) {
    if(!this.startPosition)
      return;
    event.preventDefault();

    this.deltaX = event.touches[0].clientX - this.startPosition.clientX;
    this.containerNode.children[0].style.transform = `translateX(${this.deltaX}px)`;
  }

  onTouchEnd(event) {
    this.startPosition = null;
    if(this.deltaX > 100 && !this.isFirst()) {
      this.previous();
      return;
    }
    if(this.deltaX < -100 && !this.isLast()) {
      this.next();
      return;
    }
    // If we didn’t cross the threshold, slide image
    // back to center.
    this.node.classList.add('linkviewer--animating');
    Utils.rAFPromise()
      .then(_ => Utils.rAFPromise())
      .then(_ => {
        this.containerNode.children[0].style.transform = '';
        return this.node::Utils.transitionEndPromise();
      })
      .then(_ => this.node.classList.remove('linkviewer--animating'));
  }
}
