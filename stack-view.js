import {html, render} from '/lit-html.js';
import {repeat} from '/repeat.js';
import * as animationtools from '/animationtools.js';

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
  </style>
  <slot>
  </slot>
`;

export class StackView extends HTMLElement {
  static get tag() {return 'stack-view';}

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    render(shadowDomTemplate(), this.shadowRoot);
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
      const animation = el.animate([
        {transform: 'translateX(100%)', easing: 'ease-in-out'},
        {transform: 'translateX(0%)', easing: 'ease-in-out'}
      ], 1000);
      await animationtools.waapiDone(animation);
      el.classList.remove('animation-progress');
      el.classList.add('animation-done');
      Object.assign(el.style, {
        transform: '',
        transition: '',
      });
    });
  }

  async dismiss() {
    if (this.keepFirst && this.numItems === 1)
      return;

    let dismissedItem = this.topItem;
    dismissedItem.classList.add('dismissed');
    const animation = dismissedItem.animate([
      {transform: 'translateX(0%)', easing: 'ease-in-out'},
      {transform: 'translateX(100%)', easing: 'ease-in-out'},
    ], 1000);
    await animationtools.waapiDone(animation);
    this.dispatchEvent(new CustomEvent('top-view-dismiss', {bubbles: true}));
  }

  static lightDom(state) {
    return html`
      <stack-view keep-first=${state.keepFirst}>
        ${repeat(state.items, item => item.uid, item => customElements.get(item.type).lightDom(item))}
      </stack-view>
    `;
  }
}
