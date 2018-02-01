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
  }
  :host([open]) #sidenav {
    transform: translateX(0%);
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
    this.setAttribute('open', '');
  }

  close() {
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
