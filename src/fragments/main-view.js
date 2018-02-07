import SwipeableStack from '../components/swipeable-stack.js';
import {html, repeat} from '../lit/custom-lit.js';

export default class MainView extends SwipeableStack {
  static lightDom(state) {
    return html`
      <main-view keep-first=true>
        <swipeable-sidenav class="animation-done">
          <div slot="sidenav"><h1>${state.sidenav}</h1></div>
          ${customElements.get(state.root.type).lightDom(state.root)}
        </swipeable-sidenav>
        ${repeat(state.views, item => item.uid, item => customElements.get(item.type).lightDom(item))}
      </main-view>
    `;
  }
}
