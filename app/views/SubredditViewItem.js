import Config from 'modules/Config';
import Reddit from 'modules/Reddit';
import Router from 'modules/Router';
import Template from 'modules/Template';
import Utils from 'modules/Utils';
import ThreadView from 'views/ThreadView';
import LinkViewer from 'modules/LinkViewer';

const nodeTemplate = new Template(o => `
  <div class="thread__lower">
    <span class="fa fa-cloud-download"></span>
  </div>
  <div class="thread__upper">
    <a href="${o.url}" class="thread__thumbnail" style="background-image: url(${o.thumbnail})"></a>
    <div class="thread__details">
      <span class="thread__author">${o.author} (${o.domain}) ${new Date(o.created_utc).toString()} </span>
      <span class="thread__title">${o.title}</span>
    </div>
    <div class="thread__scores">
      <span class="thread__upvotes">${o.ups}</span>
      <span class="thread__downvotes">${o.downs}</span>
      <span class="thread__comments">${o.num_comments}</span>
    </div>
  </div>
`);


export default class SubredditViewItem {
  constructor(thread) {
    this.thread = thread;
    this.thread.thumbnail = this.thread.thumbnail.replace('http://', 'https://');
    this.node = document.createElement('div');
    this.node.innerHTML = nodeTemplate.render(thread);

    this.upperNode = this.node.querySelector('.thread__upper');
    this.lowerNode = this.node.querySelector('.thread__lower');
    this.clamp = Utils.clamp(0, {{config.PULLBACK.MAX}});

    this.node.classList.add('thread');
    this.node.classList.toggle('thread--nsfw', this.thread.over_18);

    this.upperNode.addEventListener('click', ::this.onClick);
    this.lowerNode.addEventListener('click', _ => this.download());
    this.upperNode.addEventListener('touchstart', ::this.onTouchStart);
    this.upperNode.addEventListener('touchmove', ::this.onTouchMove);
    this.upperNode.addEventListener('touchend', ::this.onTouchEnd);
    Reddit.isThreadInCache(this.thread.subreddit, this.thread.id)
      .then(b => this.node.classList.toggle('thread--downloaded', b));

    // TODO: remove me
    this.node._svi = this;
  }

  onClick(event) {
    if(event.target.classList.contains('thread__thumbnail'))
      return;
    Router().go(`/thread/${this.thread.subreddit}/${this.thread.id}`);
  }

  onTouchStart(event) {
    if(this.node.classList.contains('thread--downloading') ||
       this.node.classList.contains('thread--downloaded') ||
       this.node.classList.contains('thread--resetting'))
      return;

    this.startPosition = event.touches[0];
    this.node.classList.add('thread--dragging', 'thread--elevated');
    this.lock = false;
    this.deltaX = 0;
  }

  onTouchMove(event) {
    if(!this.node.classList.contains('thread--dragging'))
      return;

    this.deltaX = this.clamp(event.touches[0].pageX - this.startPosition.pageX);
    this.upperNode.style.transform = `translateX(${this.deltaX}px)`;
    if(!this.lock && this.deltaX <= 5)
      return;

    // preventDefault() causes Chrome to not throttle touchMove events
    event.preventDefault();
    this.lock = true;
    if(this.deltaX > {{config.PULLBACK.THRESHOLD}})
      this.node.classList.add('thread--would-download');
    else
      this.node.classList.remove('thread--would-download');
  }

  onTouchEnd(event) {
    this.startPosition = null;
    this.node.classList.remove('thread--would-download', 'thread--dragging');
    this.upperNode.style.transform = '';
    if(this.deltaX > {{config.PULLBACK.THRESHOLD}})
      this.download();

    let transitions = Promise.resolve();
    if(this.deltaX !== 0) {
      this.node.classList.add('thread--resetting');
      transitions = transitions
        .then(_ => Utils.rAFPromise())
        .then(_ => Utils.rAFPromise())
        .then(_ => this.node::Utils.transitionEndPromise())
        .then(_ => this.node.classList.remove('thread--resetting'));
    }
    // FIXME: WTF is going on?!! Why do I need to wait 3 seconds
    // to avoid all SVIs being promoted to their own layers?
    transitions
      .then(_ => Utils.timeoutPromise(3000))
      .then(_ => this.node.classList.remove('thread--elevated'));
  }

  download() {
    this.node.classList.add('thread--downloading');
    return Reddit.thread(this.thread.subreddit, this.thread.id, 'top', {fromNetwork: true})
      .then(thread => {
        const node = document.createElement('div');
        ThreadView.renderComments(node, thread.comments);
        const links = node.querySelectorAll('a');
        return Promise.all(
          [
            thread.url,
            ...Array.from(links).map(link => link.href)
          ].map(url => {
            try {
              url = new URL(url);
              return LinkViewer().loadLink(url);
            } catch(e) {}
          })
        );
      })
      .then(_ => {
        this.node.classList.remove('thread--downloading');
        this.node.classList.add('thread--downloaded');
      });
  }

}
