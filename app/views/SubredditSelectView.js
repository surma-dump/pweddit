import Router from 'modules/Router';
import View from 'modules/View';

export default class SubredditSelectView extends View {
  constructor() {
    super('subredditselect');
    this.node.innerHTML = `
      <form>
        <input type="text" placeholder="Enter subreddit...">
      </form>
    `;
    this.node.querySelector('form').addEventListener('submit', ::this.onSubmit);
    this.input = this.node.querySelector('input');
  }

  onSubmit(e) {
    e.preventDefault()
    Router().go(`/r/${this.input.value}`);
  }

  update() {}
}
