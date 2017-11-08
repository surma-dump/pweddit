
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
    }
  </style>
  <slot></slot>
`;
class PwedditStack extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'}).appendChild(styles.content.cloneNode(true));
  }
}

customElements.define('pweddit-stack', PwedditStack);
