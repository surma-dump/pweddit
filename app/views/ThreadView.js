import Router from 'modules/Router';
import View from 'modules/View';
import Template from 'modules/Template';
import Reddit from 'modules/Reddit';
import Utils from 'modules/Utils';
import HeaderBar from 'modules/HeaderBar';

const commentTemplate = new Template(o =>`
  <li class="comment">
    <div class="comment__body">
      <div class="comment__details">
        <div class="comment__author">
          ${o.author} ${new Date(o.created_utc*1000).toString()}
        </div>
        <div class="comment__text">
          ${Template.unescapeHTML(o.body_html)}
        </div>
      </div>
      <div class="comment__scores">
        <span class="comment__upvotes">${o.ups}</span>
        <span class="comment__downvotes">${o.downs}</span>
        <span class="comment__gilded">${o.gilded}</span>
      </div>
    </div>
    <ul class="comment__replies"></ul>
  </li>
`);

const postTemplate = new Template(o => `
  <div class="post__header">
    <a href="${o.url}" class="post__thumbnail" style="background-image: url(${o.thumbnail})"></a>
    <div class="post__details">
      <span class="post__author">${o.author} (${o.domain}) ${new Date(o.created_utc*1000).toString()} </span>
    </div>
    <div class="post__scores">
      <span class="post__upvotes">${o.ups}</span>
      <span class="post__downvotes">${o.downs}</span>
      <span class="post__comments">${o.num_comments}</span>
    </div>
  </div>
  <div class="post__body">
    <h1 class="post__title">${o.title}</h1>
    <div class="post__text">
      ${Template.unescapeHTML(o.selftext_html)}
    </div>
  </div>
`);

const errorTemplate = new Template(o =>`
  <div class="error">${o.errorMsg}</div>
`);

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
          this.thread.post.thumbnail = this.thread.post.thumbnail.replace('http://', 'https://');
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
