import {transitionEndPromise, requestAnimationFramePromise} from '/helper.js';

const styles = document.createElement('template')
styles.innerHTML = `
  <style>
    :host {
      display: block;
      position: relative;
    }
    ::slotted(*) {
      background-color: white;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      transform: translateX(100%);
    }
    ::slotted(.visible) {
      transform: translateX(0);
    }
  </style>
  <slot></slot>
`;
class PwedditStack extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'}).appendChild(styles.content.cloneNode(true));
    this.fadeInAnimation = '1s ease-in-out';
  }

  get topView() {
    return this.lastElementChild;
  }

  connectedCallback() {
    this.snapIn();
  }

  snapIn() {
    this.topView.classList.add('visible');
  }

  async slideIn() {
    const elem = this.topView;
    const oldStyle = elem.style.transition;
    elem.style.transition = `transform ${this.fadeInAnimation}`;
    await requestAnimationFramePromise();
    await requestAnimationFramePromise();
    elem.classList.add('visible');
    await transitionEndPromise(elem);
    elem.style.transition = oldStyle;
  }

  snapOut() {
    this.topView.classList.remove('visible');
  }

  async slideOut() {
    const elem = this.topView;
    const oldStyle = elem.style.transition;
    elem.style.transition = `transform ${this.fadeInAnimation}`;
    await requestAnimationFramePromise();
    await requestAnimationFramePromise();
    elem.classList.remove('visible');
    await transitionEndPromise(elem);
    elem.style.transition = oldStyle;
  }
}

customElements.define('pweddit-stack', PwedditStack);
