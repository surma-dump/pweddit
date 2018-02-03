import {SideNav as BaseSideNav} from '/components/side-nav.js';
import {statefulElement} from '/helpers/stateful-element.js';
import {html} from '/lit/custom-lit.js';

export class SideNav extends statefulElement(BaseSideNav) {
  static lightDom(state) {
    return html`
      <side-nav class="${state.skipAnimation?'animation-done':''}">
        <div slot="sidenav"><h1>${state.sidenav}</h1></div>
        ${customElements.get(state.main.type).lightDom(state.main)}
      </side-nav>
    `;
  }
}
