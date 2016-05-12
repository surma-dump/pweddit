import Router from 'modules/Router';
import View from 'modules/View';
import Template from 'modules/Template';
import Reddit from 'modules/Reddit';
import Utils from 'modules/Utils';
import HeaderBar from 'modules/HeaderBar';
import SubredditViewItem from 'views/SubredditViewItem';

export default class SubredditView extends View {
  constructor() {
    super('subreddit');
  }

  in(data) {
    [this.subreddit, this.sorting] = this.parseData(data);
    HeaderBar().setTitle(`/r/${this.subreddit}`);
    return Reddit.subredditThreads(this.subreddit, this.sorting)
      .then(posts => {
        this.posts = posts;
        this.updateDOM();
      })
      .then(_ => super.in(data));
  }

  updateDOM() {
    this.node::Utils.removeAllChildren();
    this.threadViewItems = this.posts.map(t => new SubredditViewItem(t));
    this.threadViewItems.forEach(tvi => this.node.appendChild(tvi.node));
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
        this.updateDOM();
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
