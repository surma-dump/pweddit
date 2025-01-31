import {html, render, repeat} from '../lit/custom-lit.js';
import litShadow from '../helpers/lit-shadow.js';
import callbackBase from '../helpers/callback-base.js';
import eventBinder from '../helpers/event-binder.js';
import * as animationtools from '../helpers/animationtools.js';

export default class SwipeableStack extends eventBinder(litShadow(callbackBase(HTMLElement))) {
  static get SWIPE_THRESHOLD() {return 20;}

  constructor() {
    super();
    this.shadowRoot.addEventListener('slotchange', this._viewChange.bind(this));
    this.addEventListener('touchstart', this._onTouchStart.bind(this));
    this.addEventListener('touchmove', this._onTouchMove.bind(this));
    this.addEventListener('touchend', this._onTouchEnd.bind(this));
  }

  _onTouchStart(ev) {
    if (ev.touches && ev.touches.length > 1)
    return;
    const clientX = (ev.touches && ev.touches[0].clientX) || ev.clientX;
    if (clientX > SwipeableStack.SWIPE_THRESHOLD)
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
    const move = Math.max(this._dragDelta, 0);
    Object.assign(this.topItem.style, {
      transform: `translateX(calc(${move}px))`
    });
  }

  async _onTouchEnd(ev) {
    if (this._dragStartX === null)
    return;
    ev.preventDefault();
    ev.stopPropagation();

    if (this._dragDelta > 150) {
      this.dismiss();
    } else {
      const el = this.topItem;
      Object.assign(el.style, {
        transition: 'transform 1s ease-in-out',
      });
      await animationtools.requestAnimationFramePromise();
      await animationtools.requestAnimationFramePromise();
      Object.assign(el.style, {
        transform: 'translateX(0%)'
      });
      await animationtools.transitionEndPromise(el);
      Object.assign(el.style, {
        transition: '',
        transform: ''
      });
    }
    this._dragStartX = null;
  }


  get keepFirst() {
    return this.hasAttribute('keep-first') && this.getAttribute('keep-first') !== 'false';
  }

  set keepFirst(val) {
    val = Boolean(val) && val !== 'false';
    if (val)
    this.setAttribute('keep-first');
    else
      this.removeAttribute('keep-first');
    }

    get topItem() {
      let last = this.lastElementChild;
      while (last && last.classList.contains('dismissed'))
      last = last.previousElementSibling;
      return last;
    }

    get numItems() {
      return Array.from(this.children).filter(f => !f.classList.contains('dismissed')).length;
    }

    _viewChange(ev) {
      const elements = ev.target.assignedNodes().filter(n => n.nodeType === 1);
      const unhandledElements =
      elements
        .filter(n => !n.classList.contains('animation-progress'))
        .filter(n => !n.classList.contains('animation-done'));
    unhandledElements.forEach(async el => {
      el.classList.add('animation-progress');
      const animation = el.animate([
        {transform: 'translateX(100%)', easing: 'ease-in-out'},
        {transform: 'translateX(0%)', easing: 'ease-in-out'}
      ], 1000);
      await animationtools.waapiDone(animation);
      el.classList.remove('animation-progress');
      el.classList.add('animation-done');
      Object.assign(el.style, {
        transform: '',
        transition: '',
      });
    });
  }

  async dismiss() {
    if (this.keepFirst && this.numItems === 1)
    return;

    let el = this.topItem;
    el.classList.add('dismissed');
    await animationtools.animateTo(el, 'transform 1s ease-in-out', {transform: 'translateX(100%)'});
    this.dispatchEvent(new CustomEvent('top-view-dismiss', {bubbles: true}));
  }

  shadowDom(state) {
    return html`
      <style>
        :host {
          position: relative;
        }
        ::slotted(*) {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
      </style>
      <slot>
      </slot>
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
    }
  }
}
