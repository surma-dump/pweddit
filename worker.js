importScripts('/comlink.global.min.js');
importScripts('/event.transferhandler.js');
importScripts('/function.transferhandler.js');

function genUID() {
  const arr = new Array(8).fill(0).map(_ => Math.floor(Math.random() * 256));
  return btoa(arr);
}

const state = {
  stack: [
    {
      uid: genUID(),
      type: 'view-a',
      title: 'stack 1',
    },
    {
      uid: genUID(),
      type: 'view-b',
      title: 'stack 2',
    },
    {
      uid: genUID(),
      type: 'view-a',
      title: 'stack 3',
    },
  ]
};

class ViewModel extends EventTarget {
  removeTopView() {
    state.stack.pop();
    this.update();
  }

  update() {
    viewmodel.dispatchEvent(new CustomEvent('view-model-change', {detail: state}));
  }
}
const viewmodel = new ViewModel();
Comlink.expose(viewmodel, self);

