import SwipeableStack from '../components/swipeable-stack.js';
import stateElement from '../helpers/state-element.js';
import {html} from '../helpers/templatetools.js';

export default class PwedditMainView extends stateElement(SwipeableStack) {
  static get lightDom() {
    return html`
      <pweddit-main-view keep-first=true>
        <swipeable-sidenav class="animation-done">
          <div slot="sidenav"><h1 part-id="sidenav"></h1></div>
          <div style="display: contents;" part-id="root"></div>
        </swipeable-sidenav>
      </pweddit-main-view>
    `;
  }

  static update(instance, state, oldState) {
    instance.part('sidenav').textContent = 'side-nav';
    customElements.get(`pweddit-${state.root.type}`).renderTo(instance.part('root'), state.root);
  }
}
