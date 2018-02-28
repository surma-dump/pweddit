import SwipeableStack from '../components/swipeable-stack.js';
import PwedditThreadView from './pweddit-thread-view.js';
import stateElement from '../helpers/state-element.js';
import {html, updateCollection} from '../helpers/templatetools.js';

export default class PwedditMainView extends stateElement(SwipeableStack) {
  static get lightDom() {
    return html`
      <pweddit-main-view keep-first=true>
        <swipeable-sidenav class="animation-done">
          <div slot="sidenav"><h1 part-id="sidenav"></h1></div>
          <div style="display: contents;" part-id="root"></div>
        </swipeable-sidenav>
        <div style="display: contents;" part-id="stack"></div>
      </pweddit-main-view>
    `;
  }

  static update(instance, state, oldState) {
    instance.part('sidenav').textContent = 'side-nav';
    customElements.get(`pweddit-${state.root.type}`).renderTo(instance.part('root'), state.root);
    const factory = PwedditThreadView.instantiate.bind(PwedditThreadView);
    updateCollection(instance.part('stack'), state.stack, factory);
  }
}
