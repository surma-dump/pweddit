const id = x => x;
export default class Template {
  static compile(strings, ...keys) {
    return new Template((dict, filter) =>
      keys.reduce(
        (prev, cur, idx) =>
          prev + filter(dict[cur]) + strings[idx + 1], strings[0]
      )
    );
  }

  constructor(compiler) {
    this.compiler = compiler;
  }

  render(data) {
    return this.compiler(data, this.filter || id);
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
