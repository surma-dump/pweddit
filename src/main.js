import UiBridge from './ui-bridge.js';
import StateManager from './state-manager.js';

[
  {tag: 'pweddit-main-view', module: import('./fragments/pweddit-main-view.js')},
  {tag: 'pweddit-thread-item', module: import('./fragments/pweddit-thread-item.js')},
  {tag: 'pweddit-thread-view', module: import('./fragments/pweddit-thread-view.js')},
  {tag: 'pweddit-thread-comment', module: import('./fragments/pweddit-thread-comment.js')},
  {tag: 'pweddit-subreddit-view', module: import('./fragments/pweddit-subreddit-view.js')},
  {tag: 'swipeable-sidenav', module: import('./components/swipeable-sidenav.js')}
]
  .map(async elem => customElements.define(elem.tag, (await elem.module).default));

Clooney.spawn(StateManager, [Clooney.asRemoteValue(new UiBridge())]);
