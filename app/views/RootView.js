import Router from '/modules/Router.js';
import View from '/modules/View.js';
import Template from '/modules/Template.js';
import Reddit from '/modules/Reddit.js';
import Utils from '/modules/Utils.js';
import HeaderBar from '/modules/HeaderBar.js';

export default class RootView extends View {
  constructor() {
    super('root');
    this.drawerControlsNode = new Template(o => `
      <div class="rootview__drawer">
        <button class="rootview__drawer__btn clear-caches-btn">Clear caches</button>
        <button class="rootview__drawer__btn reset-app-btn">Reset app</button>
      </div>
    `).renderAsDOM({})[0];

    this.drawerControlsNode.querySelector('.clear-caches-btn')
      .addEventListener('click', _ => this.clearCaches());
    this.drawerControlsNode.querySelector('.reset-app-btn')
      .addEventListener('click', _ => this.resetApp());
  }

  clearCaches() {
    console.error('Not implemented yet');
  }

  resetApp() {
    console.error('Not implemented yet');
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
