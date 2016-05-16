import Router from 'modules/Router';
import View from 'modules/View';
import Template from 'modules/Template';
import Reddit from 'modules/Reddit';
import Utils from 'modules/Utils';
import HeaderBar from 'modules/HeaderBar';

export default class ThreadView extends View {
  constructor() {
    super('thread');
    this.node.innerHTML = `
      <div class="post">
      </div>
      <ul class="comments">
      </ul>
    `
    this.postContainer = this.node.querySelector('.post');
    this.commentsContainer = this.node.querySelector('.comments')
    this.commentTemplate = new Template(`
      <li class="comment">
        <div class="comment__body">%body_html%</div>
        <ul class="comment__replies"></ul>
      </li>
    `, {unescapeHTML: true});
    this.postTemplate = new Template(`
      <h1 class="post__title">%title%</h1>
      <div class="post__body">%selftext_html%</div>
    `, {unescapeHTML: true});
  }

  in(data) {
    data = data.split('/');
    this.subreddit = data[0];
    this.threadId = data[1];
    return Promise.all([
      HeaderBar().setTitle(`/r/${this.subreddit}`),
      HeaderBar().showDrawer(),
      Reddit.thread(this.subreddit, this.threadId)
        .then(thread => {
          this.thread = thread;
          this.updatePost(thread.post);
          this.updateComments(thread.comments);
        })
    ]).then(_ => super.in(data));
  }

  refresh() {
    return this.out()
    .then(_ => Reddit.forgetThread(this.subreddit, this.threadId))
    .then(_ => this.in(`${this.subreddit}/${this.threadId}`));
  }

  updatePost(post) {
    this.postContainer::Utils.removeAllChildren();
    Array.from(this.postTemplate.renderAsDOM(post))
     .forEach(::this.postContainer.appendChild);
  }

  updateComments(comments) {
    this.commentsContainer::Utils.removeAllChildren();
    this.renderComments(this.commentsContainer, comments);
  }

  renderComments(container, comments) {
    comments
      .filter(comment => !!comment.body)
      .forEach(comment => {
        const commentNode = this.commentTemplate.renderAsDOM(comment)[0];

        // TODO: Remove this
        commentNode._comment = comment;

        if(comment.replies && comment.replies.data && comment.replies.data.children)
          this.renderComments(
            commentNode.querySelector('.comment__replies'),
            comment.replies.data.children.map(c => c.data)
          );
        container.appendChild(commentNode);
      });
  }

  update() {}
}
