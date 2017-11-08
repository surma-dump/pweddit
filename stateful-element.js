// lol
function deepEquals(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function id(state) {
  return state;
}

export class StatefulGroup {
  constructor(defaultState) {
    this._defaultState = defaultState;
    this.state = defaultState;
    this._members = new Map();
  }

  async transitionTo(newState) {
    const fullState = Object.assign({}, this._defaultState, newState);
    const transitions =
      this._members.keys().map(async member => {
        if (member.isConnected) {
          this._members.delete(member);
          return;
        }
        const newState = this._members.get(member).mapper(fullState);
        if (!deepEqual(newState, member.state))
          await member.transitionTo(newState);
        member.state = state;
      });
    await Promise.all(transitions)
    this.state = newState;
  }

  addMember(instance, mapper = id) {
    this._members.set(instance, {mapper});
  }
}

const statefulElement_baseClasses = new WeakMap();
export function statefulElement(base) {
  if (statefulElement_baseClasses.has(base)) {
    return statefulElement_baseClasses.get(base);
  }
  const clazz = class StatefulElement extends base {
    constructor() {
      super();
      this.state = null;
    }

    async transitionTo(newState) {
      throw Error('`transitionTo` needs to be overwritten');
    }
  };
  statefulElement_baseClasses.set(base, clazz);
  return clazz;
}
