import {html, render} from '/lit-html.js';

const shadowDomTemplate = state => html`
  <style>
    :host {
      display: block;
      background-color: blue;
    }
  </style>
  <slot></slot>
`;

export class ViewB extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    render(shadowDomTemplate(), this.shadowRoot);
  }

  static LightDom(state) {
    return html`
      <view-b>
        <h1>${state.title}</h1>
      </view-b>
    `;
  }
}

customElements.define('view-b', ViewB);
