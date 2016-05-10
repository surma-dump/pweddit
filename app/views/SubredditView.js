import Router from 'modules/Router';
import View from 'modules/View';
import Template from 'modules/Template';
import Reddit from 'modules/Reddit';
import Utils from 'modules/Utils';

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
    this.subreddit = data;
    return Reddit.subredditThreads(this.subreddit)
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

  update() {}
}
