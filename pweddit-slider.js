
const styles = document.createElement('template')
styles.innerHTML = `
  <style>
  :host {
    display: flex;
    flex-direction: row;
    overflow: auto;
  }
  ::slotted(*) {
    width: 100%;
    height: 100%;
    flex-basis: 100%;
    flex-grow: 0;
    flex-shrink: 0;
  }
  </style>
  <slot></slot>
`;
class PwedditSlider extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'}).appendChild(styles.content.cloneNode(true));
  }
}

customElements.define('pweddit-slider', PwedditSlider);
