export function requestAnimationFramePromise() {
  return new Promise(resolve => requestAnimationFrame(resolve));
}

export function transitionEndPromise(elem, duration = 0) {
  const tep = new Promise(resolve => {
    elem.addEventListener('transitionend', function l(ev) {
      if (ev.target !== elem) return;
      elem.removeEventListener('transitionend', l);
      resolve();
    });
  });
  if (duration <= 0) {
    return tep;
  }
  return Promise.race([
    tep,
    new Promise(resolve => setTimeout(resolve, duration))
  ]);
}
