import FlexList from '../components/flex-list.js';
import {Template, html} from '../helpers/templatetools.js';

const template = new Template( html`
  <subreddit-view part-id="items">
  </subreddit-view>
`);

const extraItemData = new WeakMap();
export default class SubredditView extends FlexList {
  static update(instance, state, oldState) {
    const itemPart = instance.parts('items');
    const existingItems = Array.from(itemPart.children);
    // const existingItemIdMap = targetItems.reduce((map, item) => Object.assign(map, {[item.state.id]: item}), {});
    const targetItems = state.threads;
    const targetItemIdMap = targetItems.reduce((map, item) => Object.assign(map, {[item.id]: item}), {});

    const deletedItemIds = Object.keys(existingItems).map(item => item.state.id).filter(id => !(id in targetItemIdMap));
    deletedItemIds.forEach(item => item.remove());

    const targetItemIt = targetItems[Symbol.iterator]();
    const existingItemIt = existingItems[Symbol.iterator]();
    while (true) {
      const {value: existingItem} = existingItemIt.next();
      const {value: targetItem} = targetItemIt.next();
    }

    instance.part('items').textContent = 'lol';
  }

  static renderTo(state, container) {
    template.instantiate(container, SubredditView.update).update(state);
  }

    // state.threads.forEach(thread => {

    // });
    // instance.
    // const deletedThreads =
    //   Array.from(instance['_host'].children).filter(threadItem => {
    //     const id = extraItemData.get(threadItem).id;
    //     const stillAlive = state.threads.any(thread => thread.id === id);
    //     return !stillAlive;
    //   });
    // deletedThreads.forEach(it => it.remove());
    // let curItem = instance['_host'].firstElementChild;
    // let curExtraData = extraItemData.get(curItem);
    // state.threads.forEach(thread => {
    //   if (curExtraData.id === thread.id) {
    //     // curExtraData.instance
    //   }
    // });
    // return instance;
}
