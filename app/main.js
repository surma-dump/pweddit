import Router from 'modules/Router';
import View from 'modules/View';

Router().add('_root', class extends View {
  constructor() {
    super('_root');
    this.node.textContent = 'body';
  }
});

Router().add('r', class extends View {
  constructor() {
    super('r');
  }

  in(data) {
    this.node.textContent = `subreddit ${data}`;
    return super.in();
  }
});

navigator.serviceWorker.register('/sw.js');
