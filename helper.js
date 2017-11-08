export function transitionEndPromise(elem) {
  return new Promise(resolve => {
    elem.addEventListener('transitionend', function l(ev) {
      if (ev.target !== elem) return;
      elem.removeEventListener('transitionend', l);
      resolve();
    });
  });
}

export function requestAnimationFramePromise() {
  return new Promise(resolve => requestAnimationFrame(resolve));
}
