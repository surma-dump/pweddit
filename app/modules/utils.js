export default class Utils {
  static isMainThread() {
    return self === window;
  }

  static isWorkerRuntime() {
    return !!self.importScripts;
  }

  static supportsServiceWorker() {
    return 'serviceWorker' in navigator;
  }

  static supportsBgSync() {
    return 'SyncManager' in window;
  }

  static isServiceWorker() {
    return typeof ServiceWorkerGlobalScope !== 'undefined'
      && self instanceof ServiceWorkerGlobalScope;
  }

  static allMatches(s) {
    let matches = [];
    let match;
    while(match = this.exec(s)) {
      if(match)
        matches.push(match)
    }
    return matches;
  }

  static supportsWebm() {
    const n = document.createElement('video');
    return n.canPlayType('video/webm; codecs="vp8, vorbis"') !== '';
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

  static _rAFPromise() {
    return new Promise(resolve => {
      requestAnimationFrame(resolve);
    });
  }

  // We are doing double rAFs at all times because waiting an extra frame
  // won't cost much but apparently ensures rasterization
  static rAFPromise() {
    return Utils._rAFPromise()
      .then(_ => Utils._rAFPromise());
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
