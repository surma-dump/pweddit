import * as animationtools from '../helpers/animationtools.js';
import litShadow from '../helpers/lit-shadow.js';
import eventBinder from '../helpers/event-binder.js';
import callbackBase from '../helpers/callback-base.js';
import {html, render} from '../lit/custom-lit.js';

export default class SwipeableSidenav extends eventBinder(litShadow(callbackBase(HTMLElement))) {
  static get SWIPE_THRESHOLD() {return 10;}

  constructor() {
    super();
    this._sidenav = this.shadowRoot.querySelector('#sidenav');
  }

  connectedCallback() {
    super.connectedCallback();
    this._sidenavSize = this._sidenav.getBoundingClientRect();
  }

  get isOpen() {
    return this.hasAttribute('open');
  }

  get isClosed() {
    return !this.isOpen;
  }

  _isSidenavElement(el) {
    // If the element passed to this function is either:
    // - a child to any of the nodes that have been slotted into the <slot>
    // - or a child to the sidenav div
    // than the element is part of the sidenav.
    const assignedNodes = this._sidenav.querySelector('slot').assignedNodes();
    assignedNodes.push(this._sidenav);
    do {
      if (assignedNodes.includes(el))
        return true;
      el = el.parentElement;
    } while(el);
    return false;
  }

  _onTouchStart(ev) {
    if (ev.touches && ev.touches.length > 1)
      return;
    const clientX = (ev.touches && ev.touches[0].clientX) || ev.clientX;
    if (this.isClosed && clientX > SwipeableSidenav.SWIPE_THRESHOLD)
      return;
    // ev.touches[0].target (and event.target) ignores ShadowDOM elements. The
    // backdrop of our sidenav is a ShadowDOM element, so we use path instead.
    if (this.isOpen && !this._isSidenavElement(ev.path[0]))
      return;
    this._dragStartX = clientX;
    ev.preventDefault();
    ev.stopPropagation();
  }

  _onTouchMove(ev) {
    if (this._dragStartX === null)
      return;
    ev.preventDefault();
    ev.stopPropagation();

    const clientX = (ev.touches && ev.touches[0].clientX) || ev.clientX;
    this._dragDelta = clientX - this._dragStartX;
    const move = this.isClosed ?
      Math.min(this._dragDelta, this._sidenavSize.width) :
      Math.min(this._dragDelta, 0);
    const start = this.isClosed ? '-100%' : '0%';
    Object.assign(this._sidenav.style, {
      transform: `translateX(calc(${start} + ${move}px))`,
      transition: ''
    });
  }

  _onTouchEnd(ev) {
    if (this._dragStartX === null)
    return;
    ev.preventDefault();
    ev.stopPropagation();

    if (Math.abs(this._dragDelta) > 50)
    this.toggle();
    else
    this._reset();
    this._dragStartX = null;
  }

  async open() {
    await animationtools.animateTo(this._sidenav, 'transform 1s ease-in-out', {transform: 'translateX(0%)'});
    this.setAttribute('open', '');
  }

  async close() {
    await animationtools.animateTo(this._sidenav, 'transform 1s ease-in-out', {transform: 'translateX(-100%)'});
    this.removeAttribute('open');
  }

  async _reset() {
    if (this.isOpen)
      await this.open();
    else
      await this.close();
  }

  async toggle() {
    if (this.isOpen)
      await this.close();
    else
      await this.open();
  }

  shadowDom(state) {
    return html`
      <style>
        :host {
          position: relative;
        }
        #sidenav {
          position: fixed;
          top: 0;
          left: 0;
          width: 30vw;
          height: 100vh;
          transform: translateX(-100%);
          background-color: white;
          pointer-events: none;
          overflow: hidden;
        }
        :host([open]) #sidenav {
          transform: translateX(0%);
          pointer-events: initial;
        }
        #mainslot::slotted(*) {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
      </style>
      <slot id="mainslot"></slot>
      <div id="sidenav">
        <slot name="sidenav"></slot>
      </div>
    `;
  }

  get handlerMap() {
    return {
      'touchstart': '_onTouchStart',
      'touchmove': '_onTouchMove',
      'touchend': '_onTouchEnd',
      'mousedown': '_onTouchStart',
      'mousemove': '_onTouchMove',
      'mouseup': '_onTouchEnd'
    };
  }
}
