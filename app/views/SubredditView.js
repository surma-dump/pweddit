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

    this.errorTemplate = Template.compile`
      <div class="error">${'errorMsg'}</div>
    `;
  }

  in(data) {
    [this.subreddit, this.sorting] = this.parseData(data);
    return Promise.all([
      HeaderBar().setTitle(`/r/${this.subreddit}`),
      HeaderBar().showDrawer(),
      Reddit.subredditThreads(this.subreddit, this.sorting)
        .then(posts => {
          this.errorMsg = null;
          this.posts = posts;
        })
        .catch(err => {
          this.posts = [];
          this.errorMsg = 'Nothing in cache';
        })
    ]).then(_ => {
      this.updateDOM();
      return super.in(data)
    });
  }

  updateDOM() {
    this.node::Utils.removeAllChildren();
    if(this.errorMsg)
      this.node.appendChild(this.errorTemplate.renderAsDOM({errorMsg: this.errorMsg})[0]);
    this.threadViewItems = this.posts.map(t => new SubredditViewItem(t));
    this.threadViewItems.forEach(tvi => this.node.appendChild(tvi.node));
  }

  refresh() {
    return this.out()
      .then(_ => Reddit.subredditThreads(this.subreddit, this.sorting, {fromNetwork: true}))
      .then(_ => this.in(`${this.subreddit}/${this.sorting}`));
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
