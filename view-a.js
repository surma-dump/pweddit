import {render, html} from '/lit-html.js';

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
  static get tag() {return 'view-a';}
  constructor() {
    super();
    this._state = {};
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

  set state(value) {
    this._state = value;
  }

  get state() {
    return this._state;
  }

  static lightDom(state) {
    return html`
      <view-a state$=${state}>
        <h1>${state.title}</h1>
      </view-a>
    `;
  }
}

customElements.define(ViewA.tag, ViewA);
