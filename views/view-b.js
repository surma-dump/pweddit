import {ViewB as BaseViewB} from '/components/view-b.js';
import {statefulElement} from '/helpers/stateful-element.js';
import {html} from '/lit/custom-lit.js';

export class ViewB extends statefulElement(BaseViewB) {
  static lightDom(state) {
    return html`
      <view-b>
        <h1>${state.title}</h1>
      </view-b>
    `;
  }
}
