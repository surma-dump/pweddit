import SwipeableStack from '../components/swipeable-stack.js';
import {Template, TemplateInstance, html} from '../helpers/templatetools.js';

const template = new Template( html`
  <main-view keep-first=true>
    <swipeable-sidenav class="animation-done">
      <div slot="sidenav"><h1 part-id="sidenav"></h1></div>
      <div style="display: contents;" part-id="root"></div>
    </swipeable-sidenav>
  </main-view>
`);

export default class MainView extends SwipeableStack {
  static update(instance, state, oldState) {
    instance.part('sidenav').textContent = 'side-nav';
    customElements.get(state.root.type).renderTo(state.stack, instance.part('root'));
  }

  static renderTo(state, container) {
    template.instantiate(container, MainView.update).update(state);
  }
}
