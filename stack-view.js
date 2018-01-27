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
  static get tag() {return 'stack-view';}
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    render(shadowDomTemplate(), this.shadowRoot);

    this.shadowRoot.querySelector('#dismiss').onclick = _ => this.dismiss();
  }

  get topItem() {
    let last = this.lastElementChild
    while (last && last.classList.contains('dismissed'))
      last = last.previousElementSibling;
    return last;
  }

  async dismiss() {
    let dismissedItem = this.topItem;
    console.log(`animation ${dismissedItem.tagName}`);
    dismissedItem.classList.toggle('dismissed')
    Object.assign(dismissedItem.style, {
      transition: 'transform 1s ease-in-out',
      transform: 'translateX(100%)'
    });
    console.log(`awaitin ${dismissedItem.tagName}`);
    await animationtools.transitionEndPromise(dismissedItem);
    console.log(`dispatching ${dismissedItem.tagName}`)
    this.dispatchEvent(new CustomEvent('top-view-dismiss', {
      bubbles: true
    }));
  }

  static LightDom(state) {
    return html`
      <stack-view>
        ${repeat(state.stack, item => item.uid, item => componentMap.get(item.type).LightDom(item))}
      </stack-view>
    `;
  }
}

customElements.define(StackView.tag, StackView);
