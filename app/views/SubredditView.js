import Router from 'modules/Router';
import View from 'modules/View';
import Template from 'modules/Template';
import Reddit from 'modules/Reddit';
import Utils from 'modules/Utils';

export default class SubredditView extends View {
  constructor() {
    super('subreddit');
    this.postTemplate = new Template('<img src="%thumbnail%">%title%');
  }

  in(data) {
    this.subreddit = data;
    return Reddit.subredditPosts(this.subreddit)
      .then(posts => {
        this.updateList(posts);
      })
      .then(_ => super.in(data));
  }

  updateList(posts) {
    this.node::Utils.removeAllChildren();
    for(let post of posts) {
      const n = document.createElement('div');
      n.id = post.id;
      n.innerHTML = this.postTemplate.render(post);
      this.node.appendChild(n);
    }
  }

  update(data) {
    return this.out().then(_ => this.in(data));
  }
}
