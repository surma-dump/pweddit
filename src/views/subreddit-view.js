import FlexList from '/components/flex-list.js';
import {html, repeat} from '/lit/custom-lit.js';

export default class SubredditView extends FlexList {
  static lightDom(state) {
    return html`
      <subreddit-view>
        ${repeat(state.threads, item => item.uid, item => customElements.get(item.type).lightDom(item))}
      </subreddit-view>
    `;
  }
}
