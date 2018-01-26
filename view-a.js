import {html, render} from '/lit-html.js';

const shadowDomTemplate = state => html`
  <style>
    :host {
      display: block;
      background-color: red;
    }
  </style>
  <slot></slot>
`;

export class ViewA extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    render(shadowDomTemplate(), this.shadowRoot);
  }

  static LightDom(state) {
    return html`
      <view-a>
        <h1>${state.title}</h1>
      </view-a>
    `;
  }
}

customElements.define('view-a', ViewA);
