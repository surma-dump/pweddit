import * as animationtools from '/animationtools.js';
import {html, render} from '/lit-html.js';

const shadowDomTemplate = state => html`
<style>
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
</style>
<slot id="mainslot"></slot>
<div id="sidenav">
  <slot name="sidenav"></slot>
</div>
`;

export class SideNav extends HTMLElement {
  static get tag() {return 'side-nav';}

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    render(shadowDomTemplate(), this.shadowRoot);
    this._sidenav = this.shadowRoot.querySelector('#sidenav');
  }

  async open() {
    Object.assign(this._sidenav.style, {
      transition: 'transform 1s ease-in-out'
    });
    await animationtools.requestAnimationFramePromise();
    await animationtools.requestAnimationFramePromise();
    Object.assign(this._sidenav.style, {
      transform: 'translateX(0%)'
    });
    await animationtools.transitionEndPromise(this._sidenav);
    Object.assign(this._sidenav.style, {
      transition: '',
      transform: ''
    });
    this.setAttribute('open', '');
  }

  async close() {
    Object.assign(this._sidenav.style, {
      transition: 'transform 1s ease-in-out',
      pointerEvents: 'none'
    });
    await animationtools.requestAnimationFramePromise();
    await animationtools.requestAnimationFramePromise();
    Object.assign(this._sidenav.style, {
      transform: 'translateX(-100%)'
    });
    await animationtools.transitionEndPromise(this._sidenav);
    Object.assign(this._sidenav.style, {
      transition: '',
      pointerEvents: ''
    });
    this.removeAttribute('open');
  }

  static lightDom(state) {
    return html`
      <side-nav>
        <div slot="sidenav">${state.sidenav}</div>
        ${customElements.get(state.main.type).lightDom(state.main)}
      </side-nav>
    `;
  }
}
