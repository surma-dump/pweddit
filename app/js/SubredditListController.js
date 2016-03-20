import Reddit from 'Reddit';

export default class SubredditListController {
  constructor(container) {
    this._container = container;
    this._render();
  }

  get subreddit() {
    return this._subreddit;
  }

  set subreddit(newVal) {
    this._subreddit = newVal;
    this._updateList().then(::this._render);
  }

  async _updateList() {
    if(this.subreddit === '') {
      this._list = [];
      return;
    }
    this._posts = await Reddit.SubredditPosts(this.subreddit);
  }

  _render() {
    while(this._container.firstChild) {
      this._container.removeChild(this._container.firstChild);
    }
    if(!this._posts) {
      return;
    }
    this._posts.forEach(post => {
      const n = document.createElement('div');
      n.textContent = post.title;
      this._container.appendChild(n);
    });
  }
}
