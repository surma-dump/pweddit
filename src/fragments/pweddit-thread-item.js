import FlexList from '../components/flex-list.js';
import {Template, html} from '../helpers/templatetools.js';

const template = new Template( html`
  <pweddit-thread-item>
    <img part-id="image">
    <section class="meta">
      <a part-id="title"></a>
      <span part-id="author"></span>
      <span part-id="subreddit"></span>
      <span part-id="date"></span>
    </section>
  </pweddit-thread-item>
`);

const shadowTemplate = new Template( html`
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
`);


export default class PwedditThreadItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    shadowTemplate.instantiate(this.shadowRoot, _ => {});
  }

  static update(instance, state, oldState) {
    instance.part('image').src = state.image;
    instance.part('title').textContent = state.title;
    instance.part('title').href = `/comments/${state.thread_id}`;
    instance.part('author').textContent = state.author;
    instance.part('date').textContent = state.date;
    instance.part('subreddit').textContent = `/r/${state.subreddit}`;
  }

  static instantiate(state) {
    const instance = template.instantiate2(PwedditThreadItem.update);
    instance.update(state);
    return instance;
  }

  static renderTo(state, container) {
    template.instantiate(container, PwedditThreaditem.update).update(state);
  }

}
