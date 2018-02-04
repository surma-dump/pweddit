import {html, render} from '/lit/custom-lit.js';

const shadowDomTemplate = state => html`
  <style>
    :host {
      display: flex;
      flex-direction: ${state.horizontal?'row':'column'};
    }
  </style>
  <slot></slot>
`;

export class FlexList extends HTMLElement {
  static get observedAttributes() {return ['horizontal']}

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    render(shadowDomTemplate({}), this.shadowRoot);
  }

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
}
