const port = Symbol('EventTargetPolyfill');
export default class EventTargetPolyfill {
  constructor() {
    const {port1} = new MessageChannel();
    this[port] = port1;
  }

  addEventListener(name, f) {
    this[port].addEventListener(name, f);
  }

  dispatchEvent(ev) {
    this[port].dispatchEvent(ev);
  }
}
