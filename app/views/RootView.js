import Router from '/modules/Router.js';
import View from '/modules/View.js';
import Template from '/modules/Template.js';
import Reddit from '/modules/Reddit.js';
import Utils from '/modules/Utils.js';
import HeaderBar from '/modules/HeaderBar.js';

export default class RootView extends View {
  constructor() {
    super('root');
  }

  in(data) {
    return HeaderBar().setTitle()
      .then(_ => super.in(data));
  }
}
