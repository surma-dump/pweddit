import UI from './ui.js';
import StateManager from './state-manager.js';

[
  {tag: 'main-view', module: import('./fragments/main-view.js')},
  {tag: 'thread-item', module: import('./fragments/thread-item.js')},
  {tag: 'thread-view', module: import('./fragments/thread-view.js')},
  {tag: 'subreddit-view', module: import('./fragments/subreddit-view.js')},
  {tag: 'swipeable-sidenav', module: import('./components/swipeable-sidenav.js')}
]
  .map(async elem => customElements.define(elem.tag, (await elem.module).default));

Clooney.spawn(StateManager, [ui]);
