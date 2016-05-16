const MARKER_START = '%';
const MARKER_END = '%'
const r = new RegExp(`${MARKER_START}(.+?)${MARKER_END}`, 'g')

export default class Template {
  constructor(template, opts) {
    this.template = template;
    this.keys = new Map();
    this.options = Object.assign({
      unescapeHTML: false
    }, opts);

    let match;
    while((match = r.exec(template)) !== null)
      this.keys.set(match[1], new RegExp(`${MARKER_START}${match[1]}${MARKER_END}`, 'g'));
  }
  render(data) {
    let result = this.template;
    this.keys.forEach((regexp, name) => {
      let value = data[name];
      if(this.options.unescapeHTML) {
        value = this.unescapeHTML(value);
      }
      result = result.replace(regexp, value);
    });
    return result;
  }
  renderAsDOM(data) {
    const container = document.createElement('div');
    container.innerHTML = this.render(data);
    return Array.from(container.children);
  }

  unescapeHTML(t) {
    const node = document.createElement('div');
    node.innerHTML = t;
    return node.innerText;
  }
}
