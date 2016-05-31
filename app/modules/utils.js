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

  static animationIterationPromise() {
    const elem = this;
    return new Promise(resolve => {
      elem.addEventListener('animationiteration', function handler() {
        elem.removeEventListener('animationiteration', handler);
        resolve();
      });
    });
  }

  static rAFPromise() {
    return new Promise(resolve => {
      requestAnimationFrame(resolve);
    });
  }

  static rICPromise() {
    return new Promise(resolve => {
      requestIdleCallback(resolve);
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

  static clamp(min, max) {
    return (v) => Math.max(Math.min(max, v), min);
  }

  static areArraysEqual(a, b) {
    return a.length == b.length
      && a.reduce((old, _, idx) => old && a[idx] == b[idx], true);
  }
}
