import SwipeableStack from '../components/swipeable-stack.js';
import {Template, TemplateInstance, html} from '../helpers/templatetools.js';

const template = new Template( html`
  <pweddit-main-view keep-first=true>
    <swipeable-sidenav class="animation-done">
      <div slot="sidenav"><h1 part-id="sidenav"></h1></div>
      <div style="display: contents;" part-id="root"></div>
    </swipeable-sidenav>
  </pweddit-main-view>
`);

export default class PwedditMainView extends SwipeableStack {
  static update(instance, state, oldState) {
    instance.part('sidenav').textContent = 'side-nav';
    customElements.get(`pweddit-${state.root.type}`).renderTo(state.root, instance.part('root'));
  }

  static renderTo(state, container) {
    template.instantiate(container, PwedditMainView.update).update(state);
  }
}
