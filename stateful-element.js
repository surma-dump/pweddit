function deepEquals(a, b) {
  return false; // TODO
}

export class StatefulGroup {
  constructor(state) {
    this._defaultState = state;
    this.state = state;
    this._instances = new Set();
    this._baseClasses = new WeakMap();
  }

  update(newState) {
    const fullState = Object.assign({}, this._defaultState, newState);
    for(const instance of this._instances) {
      instance.update(fullState);
    }
    this.state = newState;
  }

  statefulElement(base) {
    if (this._baseClasses.has(base)) {
      return this._baseClasses.get(base);
    }
    const instances = this._instances;
    const getState = () => this.state;
    const clazz = class StatefulElement extends base {
      constructor() {
        super();
        instances.add(this);
        this.state = null;
        this.update(getState());
      }

      update(newState) {
        throw Error('`newState` needs to be overwritten');
      }
    }
    this._baseClasses.set(base, clazz);
    return clazz;
  }
}
