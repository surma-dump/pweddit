export function requestAnimationFramePromise() {
  return new Promise(resolve => requestAnimationFrame(resolve));
}

export function transitionEndPromise(elem, duration = 0) {
  const tep = new Promise(resolve => {
    elem.addEventListener('transitionend', ev => {
      if (ev.target !== elem) return;
      resolve();
    }, {once: true});
  });
  if (duration <= 0) {
    return tep;
  }
  return Promise.race([
    tep,
    new Promise(resolve => setTimeout(resolve, duration))
  ]);
}

export function waapiDone(animation) {
  return new Promise(resolve => {
    animation.addEventListener('finish', resolve, {once: true});
  })
}
