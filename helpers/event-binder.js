export default function eventBinder(map, clazz) {
  return class extends clazz {
    constructor() {
      super();
      for(const [eventName, handler] of Object.entries(map))
        this[handler] = this[handler].bind(this);
    }

    connectedCallback() {
      super.connectedCallback();
      for(const [eventName, handler] of Object.entries(map))
        this.addEventListener(eventName, this[handler]);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      for(const [eventName, handler] of Object.entries(map))
        this.removeEventListener(eventName, this[handler]);
    }
  }
}
