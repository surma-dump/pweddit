export default class Utils {
  static isWorkerRuntime() {
    return !!self.importScripts;
  }

  static transitionEndPromise() {
    const elem = this;
    return new Promise(resolve => {
      elem.addEventListener('transitionend', function handler() {
        elem.removeEventListener('transitionend', handler);
        resolve();
      });
    });
  }

  static rAFPromise() {
    return new Promise(resolve => {
      requestAnimationFrame(_ => {
        resolve();
      });
    });
  }

  static timeoutPromise(delay) {
    return new Promise(resolve => {
      setTimeout(resolve, delay);
    });
  }

  static removeAllChildren() {
    while(this.firstChild) {
      this.removeChild(this.firstChild);
    }
  }
}
