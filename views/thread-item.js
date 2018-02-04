import {FlexList} from '/components/flex-list.js';
import {html, render, repeat} from '/lit/custom-lit.js';


const shadowDomTemplate = state => html`
  <style>
    :host {
      --height: 10vh;
      display: flex;
      flex-direction: row;
      height: var(--height);
    }
    ::slotted(img) {
      height: var(--height);
      width: var(--height);
      flex-shrink: 0;
      flex-grow: 0;
    }
    ::slotted(*:not(img)) {
      flex-grow: 1;
    }
  </style>
  <slot></slot>
`;

export class ThreadItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    render(shadowDomTemplate(), this.shadowRoot);
  }

  static lightDom(state) {
    return html`
      <thread-item>
        <img src="/images/kitty.jpg">
        <section>
          <p>${state.title}</p>
          <span>${state.author}</span>
          <span>/r/${state.subreddit}</span>
          <span>${state.date}</span>
        </section>
      </thread-item>
    `;
  }
}
