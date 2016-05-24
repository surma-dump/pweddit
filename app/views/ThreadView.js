import Router from 'modules/Router';
import View from 'modules/View';
import Template from 'modules/Template';
import Reddit from 'modules/Reddit';
import Utils from 'modules/Utils';
import HeaderBar from 'modules/HeaderBar';

const commentTemplate = Template.compile`
  <li class="comment">
    <div class="comment__body">${'body_html'}</div>
    <ul class="comment__replies"></ul>
  </li>
`;
commentTemplate.filter = Template.unescapeHTML;

const postTemplate = Template.compile`
  <h1 class="post__title">${'title'}</h1>
  <div class="post__media"><a href="${'url'}"><img src="${'thumbnail'}"></a></div>
  <div class="post__body">${'selftext_html'}</div>
`;
postTemplate.filter = Template.unescapeHTML;

const errorTemplate = Template.compile`
  <div class="error">${'errorMsg'}</div>
`;

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
  }

  in(data) {
    [this.subreddit, this.threadId, this.sorting] = this.parseData(data);
    return Promise.all([
      HeaderBar().setTitle(`/r/${this.subreddit}`),
      HeaderBar().showDrawer(),
      Reddit.thread(this.subreddit, this.threadId)
        .then(thread => {
          this.errorMsg = null;
          this.thread = thread;
        })
        .catch(err => {
          this.thread = {};
          this.errorMsg = 'Nothing in cache';
        })
    ]).then(_ => {
      this.updatePost(this.thread.post, this.errorMsg);
      this.updateComments(this.thread.comments);
      return super.in(data);
    });
  }

  refresh() {
    return this.out()
    .then(_ => Reddit.thread(this.subreddit, this.threadId, this.sorting, {fromNetwork: true}))
    .then(_ => this.in(`${this.subreddit}/${this.threadId}`));
  }

  updatePost(post, errorMsg) {
    this.postContainer::Utils.removeAllChildren();
    if(post)
      Array.from(postTemplate.renderAsDOM(post))
       .forEach(::this.postContainer.appendChild);
    if(errorMsg)
      this.postContainer.appendChild(
        errorTemplate.renderAsDOM({errorMsg})[0]
      );
  }

  updateComments(comments) {
    this.commentsContainer::Utils.removeAllChildren();
    if(!comments)
      return;
    ThreadView.renderComments(this.commentsContainer, comments);
  }

  static renderComments(container, comments) {
    comments
      .filter(comment => !!comment.body)
      .forEach(comment => {
        const commentNode = commentTemplate.renderAsDOM(comment)[0];

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

  update(data) {
    const parsedData = this.parseData(data);
    if(Utils.areArraysEqual(
      parsedData,
      [this.subreddit, this.threadId, this.sorting]
    )) {
      return Promise.resolve();
    }
    return super.update(data);
  }

  parseData(data) {
    data = data.split('/');
    return [
      data[0],
      data[1],
      data[2] || 'top'
    ];
  }
}
