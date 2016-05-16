const MARKER_START = '%';
const MARKER_END = '%'
const r = new RegExp(`${MARKER_START}(.+?)${MARKER_END}`, 'g')

export default class Template {
  constructor(template) {
    this.template = template;
    this.keys = new Map();

    let match;
    while((match = r.exec(template)) !== null)
      this.keys.set(match[1], new RegExp(`${MARKER_START}${match[1]}${MARKER_END}`, 'g'));
  }
  render(data) {
    let result = this.template;
    this.keys.forEach((v, k) => {
      result = result.replace(v, data[k]);
    });
    return result;
  }
  renderAsDOM(data) {
    const container = document.createElement('div');
    container.innerHTML = this.render(data);
    return Array.from(container.children);
  }
}
