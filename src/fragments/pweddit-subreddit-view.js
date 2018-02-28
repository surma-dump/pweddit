import FlexList from '../components/flex-list.js';
import stateElement from '../helpers/state-element.js';
import {html} from '../helpers/templatetools.js';

export default class PwedditSubredditView extends stateElement(FlexList) {
  static get lightDom() {
    return html`
      <pweddit-subreddit-view part-id="items">
      </pweddit-subreddit-view>
    `;
  }

  static update(instance, state, oldState) {
    const itemPart = instance.part('items');
    const existingItems = Array.from(itemPart.children);
    const existingItemIdMap = existingItems.reduce((map, item) => Object.assign(map, {[item.state.id]: item}), {});
    const targetItems = state.threads;
    const targetItemIdMap = targetItems.reduce((map, item) => Object.assign(map, {[item.id]: item}), {});

    const deletedItemIds = Object.keys(existingItems).map(item => item.state.id).filter(id => !(id in targetItemIdMap));
    deletedItemIds.forEach(item => item.remove());

    const targetItemIt = targetItems[Symbol.iterator]();
    const existingItemIt = existingItems[Symbol.iterator]();
    while (true) {
      const {value: existingItem} = existingItemIt.next();
      const {value: targetItem} = targetItemIt.next();
      if(!targetItem)
        break;
      if(existingItem && existingItem.state.uid === targetItem.uid) {
        itemPart.appendChild(existingItem);
        continue;
      }
      if(targetItem.uid in existingItemIdMap) {
        itemPart.appendChild(existingItem);
        continue;
      }
      const instance = customElements.get('pweddit-thread-item').instantiate(targetItem);
      itemPart.appendChild(instance);
    }
  }
}
