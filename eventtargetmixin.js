(function(scope) {
  const baseClasses = new WeakMap();
  function EventTargetMixin(base) {
    if (baseClasses.has(base)) {
      return baseClasses.get(base);
    }

    const clazz = class EventTarget extends base {
      constructor() {
        super();
        const {port1} = new MessageChannel();
        this.dispatchEvent = port1.dispatchEvent.bind(port1);
        this.addEventListener = port1.addEventListener.bind(port1);
        this.removeEventListener = port1.removeEventListener.bind(port1);
      }
    };
    baseClasses.set(base, clazz);
    return clazz;
  }

  const eventTransferHandler = {
    canHandle(obj) {
      return obj instanceof Event;
    },
    serialize(obj) {
      return {
        targetId: obj && obj.target && obj.target.id,
        targetClassList: obj && obj.target && obj.target.classList && [...obj.target.classList],
        detail: obj && obj.detail,
      };
    },
    deserialize(obj) {
      return obj;
    },
  };

  Object.assign(scope, {EventTargetMixin, eventTransferHandler});
})(self);
