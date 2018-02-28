import PwedditThreadComment from './pweddit-thread-comment.js';
import stateElement from '../helpers/state-element.js';
import withShadow from '../helpers/with-shadow.js';
import {updateCollection, html} from '../helpers/templatetools.js';

export default class PwedditThreadView extends withShadow(stateElement(HTMLElement)) {
  static shadowDom() {
    return html`
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
  }

  static lightDom() {
    return html`
      <pweddit-thread-view>
        <section class="meta">
          <h1 part-id="title"></h1>
          <span part-id="author"></span>
          <span part-id="subreddit"></span>
          <span part-id="date"></span>
        </section>
        <section class="content" part-id="post_text"></section>
        <section class="comments" part-id="comments"></section>
      </pweddit-thread-view>
    `;
  }

  static update(instance, state, oldState) {
    instance.part('title').textContent = state.title;
    instance.part('author').textContent = state.author;
    instance.part('subreddit').textContent = `/r/${state.subreddit}`;
    instance.part('date').textContent = state.date;
    instance.part('post_text').textContent = state.post_text;

    const container = instance.part('comments');
    const factory = PwedditThreadComment.instantiate.bind(PwedditThreadComment);
    updateCollection(container, state.comments, factory);
  }
}
