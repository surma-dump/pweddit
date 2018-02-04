import FlexList from '/components/flex-list.js';
import litShadow from '/helpers/lit-shadow.js';
import callbackBase from '/helpers/callback-base.js';
import {html, render, repeat} from '/lit/custom-lit.js';


const tpl = state => html`
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
    ::slotted(.meta) {
      display: flex;
      flex-direction: column;
    }
  </style>
  <slot></slot>
`;

export default class ThreadItem extends litShadow(tpl, callbackBase(HTMLElement)) {
  static lightDom(state) {
    return html`
      <thread-item>
        <img src="/images/kitty.jpg">
        <section class="meta">
          <a href="/comments/${state.thread_id}">${state.title}</a>
          <span>${state.author}</span>
          <span>/r/${state.subreddit}</span>
          <span>${state.date}</span>
        </section>
      </thread-item>
    `;
  }
}
