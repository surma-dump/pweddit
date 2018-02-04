import {ViewA as BaseViewA} from '/components/view-a.js';
import {html} from '/lit/custom-lit.js';

export class ViewA extends BaseViewA {
  static lightDom(state) {
    return html`
      <view-a>
        <h1>${state.title}</h1>
      </view-a>
    `;
  }
}
