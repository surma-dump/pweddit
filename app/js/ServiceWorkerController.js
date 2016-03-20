let singleton;
export default class ServiceWorkerController {
  static get _instance() {
    if(!singleton) {
      singleton = new ServiceWorkerController();
    }
    return singleton;
  }

  constructor() {
    this._sw = navigator.serviceWorker.register('/sw.js');
  }

  static postMessage(msg) {
    navigator.serviceWorker.controller.postMessage(msg);
  }
}
