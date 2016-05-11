import Router from 'modules/Router';
import View from 'modules/View';
import Template from 'modules/Template';
import Reddit from 'modules/Reddit';
import Utils from 'modules/Utils';
import HeaderBar from 'modules/HeaderBar';

export default class SubredditView extends View {
  constructor() {
    super('subreddit');
    this.postTemplate = new Template(`
      <div id="%id%" class="thread">
        <img src="%thumbnail%">%title%
      </div>
    `);
  }

  in(data) {
    [this.subreddit, this.sorting] = this.parseData(data);
    HeaderBar().setTitle(`/r/${this.subreddit}`);
    return Reddit.subredditThreads(this.subreddit, this.sorting)
      .then(posts => {
        this.posts = posts;
        this.updateList(posts);
      })
      .then(_ => super.in(data));
  }

  updateList(posts) {
    this.node::Utils.removeAllChildren();
    for(let post of posts) {
      const postNode = this.postTemplate.renderAsDOM(post)[0];
      postNode.addEventListener('click', _ => Router().go(`/thread/${this.subreddit}/${post.id}`));
      this.node.appendChild(postNode);
    }
  }

  refresh() {
    return this.out()
      .then(_ => Reddit.forgetSubredditThreads(this.subreddit))
      .then(_ => this.in(this.subreddit));
  }

  update(data) {
    const [newSubreddit, newSorting] = this.parseData(data);
    if(newSubreddit !== this.subreddit) {
      return this.out()
        .then(_ => this.in(data));
    }
    if(newSorting == this.sorting) {
      return Promise.resolve();
    }
    return Reddit.subredditThreads(this.subreddit, this.sorting)
      .then(posts => {
        this.posts = posts;
        this.updateList(post);
      });
  }

  parseData(data) {
    const parts = data.split('/');
    return [
      parts[0],
      parts[1] || 'hot'
    ];
  }
}
