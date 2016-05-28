const id = x => x;
export default class Template {
  constructor(template) {
    this.template = template;
  }

  render(data) {
    return this.template(data);
  }

  renderAsDOM(data) {
    const container = document.createElement('div');
    container.innerHTML = this.render(data);
    return Array.from(container.children);
  }

  static unescapeHTML(t) {
    const node = document.createElement('div');
    node.innerHTML = t;
    return node.innerText;
  }
}
