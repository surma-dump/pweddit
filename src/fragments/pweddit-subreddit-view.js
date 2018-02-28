import FlexList from '../components/flex-list.js';
import stateElement from '../helpers/state-element.js';
import {html, updateCollection} from '../helpers/templatetools.js';
import PwedditThreadItem from './pweddit-thread-item.js';

export default class PwedditSubredditView extends stateElement(FlexList) {
  static get lightDom() {
    return html`
      <pweddit-subreddit-view part-id="items">
      </pweddit-subreddit-view>
    `;
  }

  static update(instance, state, oldState) {
    const container = instance.part('items');
    const factory = PwedditThreadItem.instantiate.bind(PwedditThreadItem);
    updateCollection(container, state.threads, factory);
  }
}
