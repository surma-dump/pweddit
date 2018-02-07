import mixinMemoize from './mixin-memoize.js';

export default mixinMemoize(clazz =>
  class extends clazz {
    connectedCallback() {}
    disconnectedCallback() {}
  }
);
