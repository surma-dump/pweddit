import Reddit from 'modules/Reddit';
import Router from 'modules/Router';
import Template from 'modules/Template';
import Utils from 'modules/Utils';

const nodeTemplate = new Template(`
  <div class="thread__lower">
    <span class="fa fa-cloud-download"></span>
  </div>
  <div class="thread__upper">
    <img src="%thumbnail%" class="thread__thumbnail">
    <div class="thread__details">
      <span class="thread__title">%title%</span>
    </div>
  </div>
`);

const DOWNLOAD_THRESHOLD = 80;

export default class SubredditViewItem {
  constructor(thread) {
    this.thread = thread;
    this.node = document.createElement('div');
    this.node.innerHTML = nodeTemplate.render(thread)

    this.upperNode = this.node.querySelector('.thread__upper');
    this.lowerNode = this.node.querySelector('.thread__lower');
    this.clamp = Utils.clamp(0, 2*DOWNLOAD_THRESHOLD);

    this.node.classList.add('thread');
    this.node.classList.toggle('thread--nsfw', this.thread.over_18);

    this.upperNode.addEventListener('click', ::this.onClick);
    this.upperNode.addEventListener('touchstart', ::this.onTouchStart);
    this.upperNode.addEventListener('touchmove', ::this.onTouchMove);
    this.upperNode.addEventListener('touchend', ::this.onTouchEnd);
    Reddit.isThreadInCache(this.thread.subreddit, this.thread.id)
      .then(b => this.node.classList.toggle('thread--downloaded', b));

    // TODO: remove me
    this.node._svi = this;
  }

  onClick() {
    Router().go(`/thread/${this.thread.subreddit}/${this.thread.id}`);
  }

  onTouchStart(ev) {
    this.startPosition = ev.touches[0];
    this.lock = false;
    this.deltaX = 0;
  }

  onTouchMove(ev) {
    if(!this.startPosition)
      return;

    if(this.node.classList.contains('thread--downloading') ||
       this.node.classList.contains('thread--downloaded') ||
       this.node.classList.contains('thread--resetting'))
      return;

    this.deltaX = this.clamp(ev.touches[0].clientX - this.startPosition.clientX);
    if(!this.lock && this.deltaX <= 5)
      return;
    this.lock = true;
    ev.preventDefault();
    this.upperNode.style.transform = `translateX(${this.deltaX}px)`;
    if(this.deltaX > DOWNLOAD_THRESHOLD)
      this.node.classList.add('thread--would-download');
    else
      this.node.classList.remove('thread--would-download');
  }

  onTouchEnd(ev) {
    this.startPosition = null;
    this.node.classList.remove('thread--would-download');
    this.node.classList.add('thread--resetting');
    this.upperNode.style.transform = '';
    if(this.deltaX > DOWNLOAD_THRESHOLD) {
      this.node.classList.add('thread--downloading');
    }
    this.upperNode::Utils.transitionEndPromise()
      .then(_ => this.node.classList.remove('thread--resetting'));
  }
}
