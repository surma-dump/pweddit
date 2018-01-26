import {html, render} from '/lit-html.js';
import {repeat} from '/repeat.js';
import * as streamtools from '/streamtools.js';
import * as animationtools from '/animationtools.js';
import {ViewA} from '/view-a.js';
import {ViewB} from '/view-b.js';

const shadowDomTemplate = state => html`
  <style>
    :host {
      position: relative;
    }
    /*::slotted(*) {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }*/
  </style>
  <button id="dismiss">Dismiss top view</button>
  <slot>
  </slot>
`;

const componentMap = new Map([
  ['view-a', ViewA],
  ['view-b', ViewB],
]);

export class StackView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    render(shadowDomTemplate(), this.shadowRoot);

    this.shadowRoot.querySelector('#dismiss').onclick = _ => this.dismiss();
  }

  get topItem() {
    return this.querySelector(':scope > *:last-child');
  }

  async dismiss() {
    // Object.assign(this.topItem.style, {
    //   transition: 'transform 1s linear',
    //   transform: 'translateX(100%)'
    // });
    // await animationtools.transitionEndPromise(this.topItem);
    this.dispatchEvent(new CustomEvent('swap-top-stack-items', {bubbles: true}));
  }

  static LightDom(state) {
    return html`
      <stack-view>
        ${repeat(state.stack, item => item.uid, item => componentMap.get(item.type).LightDom(item))}
      </stack-view>
    `;
  }
}

customElements.define('stack-view', StackView);
