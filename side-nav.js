import * as animationtools from '/animationtools.js';
import {html, render} from '/custom-lit.js';

const shadowDomTemplate = state => html`
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

export class SideNav extends HTMLElement {
  static get tag() {return 'side-nav';}
  static get SWIPE_THRESHOLD() {return 2;}

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    render(shadowDomTemplate(), this.shadowRoot);
    this._sidenav = this.shadowRoot.querySelector('#sidenav');
    this.addEventListener('touchstart', this._onTouchStart.bind(this));
    this.addEventListener('touchmove', this._onTouchMove.bind(this));
    this.addEventListener('touchend', this._onTouchEnd.bind(this));
  }

  connectedCallback() {
    this._sidenavSize = this._sidenav.getBoundingClientRect();
  }

  _onTouchStart(ev) {
    if (ev.touches.length > 1)
      return;
    if (ev.touches[0].clientX > SideNav.SWIPE_THRESHOLD)
      return;
    this._dragStartX = ev.touches[0].clientX;
    ev.preventDefault();
    ev.stopPropagation();
  }

  _onTouchMove(ev) {
    if (this._dragStartX === null)
      return;
    ev.preventDefault();
    ev.stopPropagation();

    this._dragDelta = ev.touches[0].clientX - this._dragStartX;
    const move = Math.min(this._dragDelta, this._sidenavSize.width);
    Object.assign(this._sidenav.style, {
      transform: `translateX(calc(-100% + ${move}px))`
    });
  }

  _onTouchEnd(ev) {
    if (!this._dragStartX)
      return;
    ev.preventDefault();
    ev.stopPropagation();

    if (this._dragDelta > 50)
      this.open();
    else
      this.close();
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

  static lightDom(state) {
    return html`
      <side-nav state$=${state}>
        <div slot="sidenav">${state.sidenav}</div>
        ${customElements.get(state.main.type).lightDom(state.main)}
      </side-nav>
    `;
  }
}
