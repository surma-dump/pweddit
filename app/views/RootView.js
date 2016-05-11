import Router from 'modules/Router';
import View from 'modules/View';
import Template from 'modules/Template';
import Reddit from 'modules/Reddit';
import Utils from 'modules/Utils';
import HeaderBar from 'modules/HeaderBar';

export default class RootView extends View {
  constructor() {
    super('root');
  }

  in(data) {
    HeaderBar().setTitle();
    return super.in(data);
  }
}
