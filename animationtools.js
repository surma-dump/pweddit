export function requestAnimationFramePromise() {
  return new Promise(resolve => requestAnimationFrame(resolve));
}

export function transitionEndPromise(elem) {
  return new Promise(resolve => {
    console.log(`registering ${elem.tagName}`);
    elem.addEventListener('transitionend', function l(ev) {
      console.log(`fire on ${elem.tagName}`);
      if (ev.target !== elem) return;
      elem.removeEventListener('transitionend', l);
      resolve();
    });
  });
}
