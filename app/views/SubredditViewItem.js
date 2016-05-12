import Reddit from 'modules/Reddit';
import Router from 'modules/Router';
import Template from 'modules/Template';
import Utils from 'modules/Utils';

const nodeTemplate = new Template(`
  <div class="thread__lower">
  </div>
  <div class="thread__upper">
    <img src="%thumbnail%" class="thread__thumbnail">
    <div class="thread__details">
      <span class="thread__title">%title%</span>
    </div>
  </div>
`);

const progressStyleTemplate = 'linear-gradient(0deg, transparent, transparent _%, #888 _%, #888)';

export default class SubredditViewItem {
  constructor(thread) {
    this.thread = thread;
    this.node = document.createElement('div');
    this.node.classList.add('thread');
    this.node.innerHTML = nodeTemplate.render(thread)
    this.upperNode = this.node.querySelector('.thread__upper');
    this.lowerNode = this.node.querySelector('.thread__lower');
    this.upperNode.addEventListener('click', ::this.onClick);
    this.upperNode.addEventListener('touchstart', ::this.onTouchStart);
    this.upperNode.addEventListener('touchmove', ::this.onTouchMove);
    this.upperNode.addEventListener('touchend', ::this.onTouchEnd);
    this.clamp = Utils.clamp(0, 30);
    Reddit.isThreadInCache(this.thread.subreddit, this.thread.id).then(b => this.setProgress(b?100:0));

    // TODO: remove me
    this.node._svi = this;
  }

  setProgress(p) {
    this.lowerNode.style.backgroundImage = progressStyleTemplate.replace(/_/g, p);
  }

  onClick() {
    Router().go(`/thread/${this.thread.subreddit}/${this.thread.id}`);
  }

  onTouchStart(ev) {
    this.startPosition = ev.touches[0];
    this.lock = false;
  }

  onTouchMove(ev) {
    if(!this.startPosition)
      return;

    const deltaX = this.clamp(ev.touches[0].clientX - this.startPosition.clientX);
    if(!this.lock && deltaX <= 5)
      return;
    this.lock = true;
    ev.preventDefault();
    this.upperNode.style.transform = `translateX(${deltaX}px)`;
  }

  onTouchEnd(ev) {
    this.startPosition = null;
  }
}
