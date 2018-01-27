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
  static get tag() {return 'view-a';}
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    render(shadowDomTemplate(), this.shadowRoot);
  }

  static lightDom(state) {
    return html`
      <view-a>
        <h1>${state.title}</h1>
      </view-a>
    `;
  }
}

customElements.define(ViewA.tag, ViewA);
