import mixinMemoize from './mixin-memoize.js';

export default mixinMemoize(clazz =>
  class extends clazz {
    constructor() {
      super();
      for(const [eventName, handler] of Object.entries(this.handlerMap))
        this[handler] = this[handler].bind(this);
    }

    connectedCallback() {
      super.connectedCallback();
      for(const [eventName, handler] of Object.entries(this.handlerMap))
        this.addEventListener(eventName, this[handler]);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      for(const [eventName, handler] of Object.entries(this.handlerMap))
        this.removeEventListener(eventName, this[handler]);
    }
  }
);
