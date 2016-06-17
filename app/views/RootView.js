import Router from '/modules/Router.js';
import PwedditStore from '/modules/PwedditStore.js';
import View from '/modules/View.js';
import Template from '/modules/Template.js';
import Reddit from '/modules/Reddit.js';
import Utils from '/modules/Utils.js';
import HeaderBar from '/modules/HeaderBar.js';
import LinkView from '/views/LinkView.js';

export default class RootView extends View {
  constructor() {
    super('root');
    this.drawerControlsNode = new Template(o => `
      <div class="drawercontrols">
        <button class="drawercontrols__btn clear-all-caches-btn">Wipe all caches</button>
        <button class="drawercontrols__btn clear-image-caches-btn">Wipe image caches</button>
        <button class="drawercontrols__btn reset-app-btn">Reset app</button>
      </div>
    `).renderAsDOM({})[0];

    this.drawerControlsNode.querySelector('.clear-all-caches-btn')
      .addEventListener('click', _ => this.wipeAllCaches());
    this.drawerControlsNode.querySelector('.clear-image-caches-btn')
      .addEventListener('click', _ => this.wipeImageCaches());
    this.drawerControlsNode.querySelector('.reset-app-btn')
      .addEventListener('click', _ => this.resetApp());
  }

  wipeAllCaches() {
    return Promise.all([
      LinkView().wipeCaches(),
      Reddit.wipeCaches()
    ])
    .then(_ => HeaderBar().addNotification('All caches wiped!'));
  }

  wipeImageCaches() {
    return LinkView().wipeCaches()
      .then(_ => HeaderBar().addNotification('Image caches wiped!'));
  }

  resetApp() {
    return Promise.all([
      LinkView().wipeCaches(),
      Reddit.wipeCaches(),
      PwedditStore().wipe(),
    ])
    .then(_ => {
      if(!('serviceWorker' in navigator))
        return;
      return navigator.serviceWorker.getRegistration()
        .then(registration => registration.unregister());
    })
    .then(_ => caches.delete('pweddit'))
    .then(_ => HeaderBar().addNotification('Caches wiped & ServiceWorker uninstalled!'));
  }

  in(data) {
    return HeaderBar().setTitle()
      .then(_ => {
        HeaderBar().setDrawerControls(this.drawerControlsNode);
        return super.in(data);
      });
  }

  update(){}
}
