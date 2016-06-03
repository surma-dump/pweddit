import Router from '/modules/Router.js';
import View from '/modules/View.js';
import Template from '/modules/Template.js';
import Reddit from '/modules/Reddit.js';
import Utils from '/modules/Utils.js';
import HeaderBar from '/modules/HeaderBar.js';

const commentTemplate = new Template(o =>`
  <li class="comment">
    <div class="comment__body">
      <div class="comment__content">
        <div class="comment__details">
          <span class="comment__author">${o.author}</span> ${new Date(o.created_utc*1000).toString()}
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
      <span class="post__author">${o.author}</span> (${o.domain}) ${new Date(o.created_utc*1000).toString()}
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
    if(post) {
      Array.from(postTemplate.renderAsDOM(post))
       .forEach(::this.postContainer.appendChild);
      this.postContainer.classList.toggle('post--stickied', post.stickied);
      this.postContainer.classList.toggle('post--edited', post.edited);
      this.postContainer.classList.toggle('post--moderator', post.distinguished === 'moderator');
      this.postContainer.classList.toggle('post--admin', post.distinguished === 'admin');
      this.postContainer.classList.toggle('post--nsfw', post.over_18);
    }
    if(errorMsg)
      this.postContainer.appendChild(
        errorTemplate.renderAsDOM({errorMsg})[0]
      );
  }

  updateComments(comments) {
    this.commentsContainer::Utils.removeAllChildren();
    if(!comments)
      return;
    ThreadView.renderComments(this.commentsContainer, comments, this.thread.post.author);
    Array.from(this.commentsContainer.querySelectorAll('a'))
      .forEach(a => {
        if(!a.href)
          return;
        if(a.textContent === a.href)
          return;
        const url = new URL(a.href);
        a.dataset.domain = url.hostname;
      });
  }

  static renderComments(container, comments, author) {
    comments
      .filter(comment => !!comment.body)
      .forEach(comment => {
        const commentNode = commentTemplate.renderAsDOM(comment)[0];

        // TODO: Remove this
        commentNode._comment = comment;
        commentNode.classList.toggle('comment--stickied', comment.stickied);
        commentNode.classList.toggle('comment--edited', comment.edited);
        commentNode.classList.toggle('comment--moderator', comment.distinguished === 'moderator');
        commentNode.classList.toggle('comment--admin', comment.distinguished === 'admin');
        commentNode.classList.toggle('comment--submitter', comment.author === author);

        if(comment.replies && comment.replies.data && comment.replies.data.children)
          this.renderComments(
            commentNode.querySelector('.comment__replies'),
            comment.replies.data.children.map(c => c.data),
            author
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
