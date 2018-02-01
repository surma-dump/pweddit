import {html, render} from '/lit-html.js';

const shadowDomTemplate = state => html`
  <style>
    :host {
      display: block;
      background-color: blue;
    }
  </style>
  <slot></slot>
  <button>Clone me</button>
`;

export class ViewB extends HTMLElement {
  static get tag() {return 'view-b';}
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    render(shadowDomTemplate(), this.shadowRoot);
    this.shadowRoot.querySelector('button').onclick = _ => this.cloneMe();
  }

  cloneMe() {
    this.dispatchEvent(new CustomEvent('add-view', {
      detail: {
        type: 'view-b',
        title: `Clone of ${this.state.title}`,
        skipAnimation: true
      },
      bubbles: true
    }));
  }


  static lightDom(state) {
    return html`
      <view-b state$=${state}>
        <h1>${state.title}</h1>
      </view-b>
    `;
  }
}
