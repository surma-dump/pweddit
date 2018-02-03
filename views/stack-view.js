import {StackView as BaseStackView} from '/components/stack-view.js';
import {statefulElement} from '/helpers/stateful-element.js';
import {html, repeat} from '/lit/custom-lit.js';

export class StackView extends statefulElement(BaseStackView) {
  static lightDom(state) {
    return html`
      <stack-view keep-first=${state.keepFirst}>
        ${repeat(state.items, item => item.uid, item => customElements.get(item.type).lightDom(item))}
      </stack-view>
    `;
  }
}
