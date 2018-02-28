import FlexList from '../components/flex-list.js';
import stateElement from '../helpers/state-element.js';
import withShadow from '../helpers/with-shadow.js';
import {html} from '../helpers/templatetools.js';

export default class PwedditThreadItem extends withShadow(stateElement(HTMLElement)) {
  static get shadowDom() {
    return  html`
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
  }

  static get lightDom() {
    return html`
      <pweddit-thread-item>
        <img part-id="image">
        <section class="meta">
          <a part-id="title"></a>
          <span part-id="author"></span>
          <span part-id="subreddit"></span>
          <span part-id="date"></span>
        </section>
      </pweddit-thread-item>
    `;
  }

  static update(instance, state, oldState) {
    instance.part('image').src = state.image;
    instance.part('title').textContent = state.title;
    instance.part('title').href = `/comments/${state.thread_id}`;
    instance.part('author').textContent = state.author;
    instance.part('date').textContent = state.date;
    instance.part('subreddit').textContent = `/r/${state.subreddit}`;
  }
}
