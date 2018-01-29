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
    ::slotted(*) {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
    button {
      position: relative;
      z-index: 999;
    }
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
    this.shadowRoot.addEventListener('slotchange', this._viewChange.bind(this));
  }

  get keepFirst() {
    return this.hasAttribute('keep-first') && this.getAttribute('keep-first') !== 'false';
  }

  set keepFirst(val) {
    val = Boolean(val) && val !== 'false';
    if (val)
      this.setAttribute('keep-first');
    else
      this.removeAttribute('keep-first');
  }

  get topItem() {
    let last = this.lastElementChild;
    while (last && last.classList.contains('dismissed'))
      last = last.previousElementSibling;
    return last;
  }

  get numItems() {
    return Array.from(this.children).filter(f => !f.classList.contains('dismissed')).length;
  }

  _viewChange(ev) {
    const elements = ev.target.assignedNodes().filter(n => n.nodeType === 1);
    const unhandledElements =
      elements
        .filter(n => !n.state.skipAnimation)
        .filter(n => !n.classList.contains('animation-progress'))
        .filter(n => !n.classList.contains('animation-done'));
    unhandledElements.forEach(async el => {
      el.classList.add('animation-progress');
      Object.assign(el.style, {
        transform: 'translateX(100%)',
      });
      await animationtools.requestAnimationFramePromise();
      await animationtools.requestAnimationFramePromise();
      Object.assign(el.style, {
        transition: 'transform 1s ease-in-out',
        transform: '',
      });
      await animationtools.transitionEndPromise(el);
      el.classList.remove('animation-progress');
      el.classList.add('animation-done');
      Object.assign(el.style, {
        transform: '',
        transition: '',
      });
    });

  }

  async dismiss() {
    if (this.numItems === 1 && this.keepFirst)
      return;

    let dismissedItem = this.topItem;
    dismissedItem.classList.toggle('dismissed');
    Object.assign(dismissedItem.style, {
      transition: 'transform 1s ease-in-out',
      transform: 'translateX(100%)'
    });
    await animationtools.transitionEndPromise(dismissedItem, 1000);
    this.dispatchEvent(new CustomEvent('top-view-dismiss', {bubbles: true}));
  }

  static lightDom(state) {
    return html`
      <stack-view keep-first=${state.keepFirst}>
        ${repeat(state.items, item => item.uid, item => componentMap.get(item.type).lightDom(item))}
      </stack-view>
    `;
  }
}

customElements.define(StackView.tag, StackView);
