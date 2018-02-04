import FlexList from '/components/flex-list.js';
import litShadow from '/helpers/lit-shadow.js';
import {html, render, repeat} from '/lit/custom-lit.js';


const tpl = state => html`
  <style>
    :host {
      display: flex;
      flex-direction: column;
      background-color: white;
    }
    ::slotted(*) {
      margin: 20px 0;
    }
  </style>
  <slot></slot>
`;

export default class ThreadView extends litShadow(tpl, HTMLElement) {
  static lightDom(state) {
    return html`
      <thread-view>
        <section class="meta">
          <h1>${state.title}</h1>
          <span>${state.author}</span>
          <span>/r/${state.subreddit}</span>
          <span>${state.date}</span>
        </section>
        <section class="content">
          ${state.post_text}
        </section>
        <section class="comments">
          ${repeat(state.comments, item => item.uid, item => html`
            <div class="comment">
              <p>${item.author}</p>
              ${item.post_text}
            </comment-item>
          `)}
        </section>
      </thread-view>
    `;
  }
}