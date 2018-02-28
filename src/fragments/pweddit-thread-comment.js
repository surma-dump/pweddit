import stateElement from '../helpers/state-element.js';
import withShadow from '../helpers/with-shadow.js';
import {html} from '../helpers/templatetools.js';

export default class PwedditThreadView extends withShadow(stateElement(HTMLElement)) {
  static shadowDom() {
    return html`
      <style>
        :host {
          display: flex;
          flex-direction: row;
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
      <pweddit-thread-comment>
        <span part-id="author"></span>
        <span part-id="comment"></span>
      </pweddit-thread-comment>
    `;
  }

  static update(instance, state, oldState) {
    instance.part('author').textContent = state.author;
    instance.part('comment').textContent = state.comment;
  }
}
