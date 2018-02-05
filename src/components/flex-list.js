import {html, render} from '../lit/custom-lit.js';
import litShadow from '../helpers/lit-shadow.js';
import callbackBase from '../helpers/callback-base.js';

export default class FlexList extends litShadow(callbackBase(HTMLElement)) {
  static get observedAttributes() {return ['horizontal']}

  get horizontal() {
    return this.hasAttribute('horizontal') && this.getAttribute('horizontal') !== 'false';
  }

  set horizontal(value) {
    val = Boolean(val) && val !== 'false';
    if (val)
      this.setAttribute('horizontal');
    else
      this.removeAttribute('horizontal');
  }

  shadowDom(state) {
    return html`
      <style>
        :host {
          display: flex;
          flex-direction: ${state.horizontal?'row':'column'};
        }
      </style>
      <slot></slot>
    `;
  }
}
