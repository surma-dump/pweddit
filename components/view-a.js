import {html, render} from '/lit/custom-lit.js';

const shadowDomTemplate = state => html`
  <style>
    :host {
      display: block;
      background-color: red;
    }
  </style>
  <slot></slot>
  <button>Clone me</button>
`;

export class ViewA extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    render(shadowDomTemplate(), this.shadowRoot);
    this.shadowRoot.querySelector('button').onclick = _ => this.cloneMe();
  }

  cloneMe() {
    this.dispatchEvent(new CustomEvent('add-view', {
      detail: {
        type: 'view-a',
        title: `Clone of ${this.state.title}`
      },
      bubbles: true
    }));
  }
}
