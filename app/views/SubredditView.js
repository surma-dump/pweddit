import Router from '/modules/Router.js';
import View from '/modules/View.js';
import Template from '/modules/Template.js';
import Reddit from '/modules/Reddit.js';
import Utils from '/modules/Utils.js';
import HeaderBar from '/modules/HeaderBar.js';
import SubredditViewItem from '/views/SubredditViewItem.js';

export default class SubredditView extends View {
  constructor() {
    super('subreddit');

    this.errorTemplate = new Template(o => `
      <div class="error">${o.errorMsg}</div>
    `);

    this.drawerControlsNode = new Template(o => `
      <div class="drawercontrols">
        <button class="drawercontrols__btn download-all-threads-btn">Download all threads</button>
      </div>
    `).renderAsDOM({})[0];

    this.drawerControlsNode.querySelector('.download-all-threads-btn')
      .addEventListener('click', _ => this.downloadAllThreads());
  }

  in(data) {
    const {subreddit, sorting} = this.parseData(data);
    this.subreddit = subreddit;
    this.sorting = sorting;
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
    ])
    .then(_ => {
      HeaderBar().setDrawerControls(this.drawerControlsNode);
      this.updateDOM();
      return super.in(data)
    })
    .then(_ => {
      // Activate thumb images *after* slide in
      Array.from(this.node.querySelectorAll('.thread__thumbnail'))
        .forEach(thumb => thumb.src = thumb.dataset.src);
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
    const {subreddit, sorting} = this.parseData(data);
    if(subreddit !== this.subreddit) {
      return this.out()
        .then(_ => this.in(data));
    }
    if(sorting === this.sorting) {
      return Promise.resolve();
    }
    this.sorting = sorting;
    return Reddit.subredditThreads(this.subreddit, this.sorting)
      .then(posts => {
        this.posts = posts;
        this.updateDOM();
      });
  }

  parseData(data) {
    const parts = data.split('/');
    return {
      subreddit: parts[0],
      sorting: parts[1] || 'hot'
    };
  }

  downloadAllThreads() {
    this.threadViewItems.forEach(tvi => tvi.download());
  }
}
