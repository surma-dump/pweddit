export default class StateManager {
  constructor(ui) {
    this._ui = ui;
    this._init();
  }

  static genUID() {
    const arr = new Array(8).fill(0).map(_ => Math.floor(Math.random() * 256));
    return btoa(arr);
  }

  async _init() {
    await this._ui.whenDefined('pweddit-main-view');
    // Set initial state
    this.state = await fetch('/states/defaultstate.json').then(resp => resp.json());
    await this.update();

    const mainView = await this._ui.querySelector('pweddit-main-view');
    mainView.addEventListener('top-view-dismiss', this.dismissTopView.bind(this));
    this._ui.addEventListener('navigate', this.onNavigate.bind(this));
  }

  async openThread(id) {
    state.views.push(await fetch('/states/newthread.json').then(resp => resp.json()));
    await this.update();
  }

  async dismissTopView() {
    this.state.views.pop();
    await this.update();
  }

  async onNavigate(ev) {
    const pathItems = new URL(ev.detail).pathname.split('/').slice(1);
    switch (pathItems[0]) {
      case 'comments':
        this.openThread(pathItems[1]);
      break;
    }
  }

  async update() {
    await this._ui.render(this.state);
  }
}
