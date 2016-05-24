import Reddit from 'modules/Reddit';
import Router from 'modules/Router';
import Template from 'modules/Template';
import Utils from 'modules/Utils';
import ThreadView from 'views/ThreadView';
import LinkViewer from 'modules/LinkViewer';

const nodeTemplate = Template.compile`
  <div class="thread__lower">
    <span class="fa fa-cloud-download"></span>
  </div>
  <div class="thread__upper">
    <a href="${'url'}"><img src="${'thumbnail'}" class="thread__thumbnail"></a>
    <div class="thread__details">
      <span class="thread__title">${'title'}</span>
    </div>
  </div>
`;

const DOWNLOAD_THRESHOLD = 80;

export default class SubredditViewItem {
  constructor(thread) {
    this.thread = thread;
    this.thread.thumbnail = this.thread.thumbnail.replace('http://', 'https://');
    this.node = document.createElement('div');
    this.node.innerHTML = nodeTemplate.render(thread)

    this.upperNode = this.node.querySelector('.thread__upper');
    this.lowerNode = this.node.querySelector('.thread__lower');
    this.clamp = Utils.clamp(0, 2*DOWNLOAD_THRESHOLD);

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
    if(event.target.nodeName === 'IMG')
      return;
    Router().go(`/thread/${this.thread.subreddit}/${this.thread.id}`);
  }

  onTouchStart(event) {
    this.startPosition = event.touches[0];
    this.node.classList.add('thread--dragging');
    this.lock = false;
    this.deltaX = 0;
  }

  onTouchMove(event) {
    if(!this.startPosition)
      return;

    if(this.node.classList.contains('thread--downloading') ||
       this.node.classList.contains('thread--downloaded') ||
       this.node.classList.contains('thread--resetting'))
      return;


    this.deltaX = this.clamp(event.touches[0].pageX - this.startPosition.pageX);
    if(!this.lock && this.deltaX <= 5)
      return;

    // preventDefault() causes Chrome to not throttle touchMove events
    event.preventDefault();

    this.lock = true;
    event.preventDefault();
    this.upperNode.style.transform = `translateX(${this.deltaX}px)`;
    if(this.deltaX > DOWNLOAD_THRESHOLD)
      this.node.classList.add('thread--would-download');
    else
      this.node.classList.remove('thread--would-download');
  }

  onTouchEnd(event) {
    this.startPosition = null;
    this.node.classList.remove('thread--would-download', 'thread--dragging');
    this.upperNode.style.transform = '';
    if(this.deltaX > DOWNLOAD_THRESHOLD)
      this.download();
    if(this.deltaX !== 0) {
      this.node.classList.add('thread--resetting');
      Utils.rAFPromise()
        .then(_ => Utils.rAFPromise())
        .then(_ => this.node::Utils.transitionEndPromise())
        .then(_ => this.node.classList.remove('thread--resetting'));
    }
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
