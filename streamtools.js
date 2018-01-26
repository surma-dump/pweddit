export function eventStream(object, eventName) {
  let listenerFunction;
  
  return new ReadableStream({
    start(controller) {
      listenerFunction = ev => {
        controller.enqueue(ev);
      };
      object.addEventListener(eventName, listenerFunction);
    },
    
    cancel() {
      object.removeEventListener(eventName, listenerFunction);
    }
  });
}

export function logStream() {
  return new TransformStream({
    transform(chunk, controller) {
      console.log(chunk);
      controller.enqueue(chunk);
    }
  });
}

export const devNull = new WritableStream();

export function mapStream(map) {
  return new TransformStream({
    transform(chunk, controller) {
      controller.enqueue(map(chunk));
    }
  });
}

export function filterStream(predicate) {
  return new TransformStream({
    transform(chunk, controller) {
      if (predicate(chunk))
        controller.enqueue(chunk);
    }
  });
}

export class MultiReadableStream {
  constructor(rs) {
    this._controllers = new Map();
    this._dispatchLoop(rs);
  }
  
  getReadableStream() {
    let list = this._controllers;
    return new ReadableStream({
      start(controller) {
        list.set(this, controller);
      },
      cancel() {
        list.delete(this);
      }
    });
  }
  
  async _dispatchLoop(rs) {
    const reader = rs.getReader();
    while (true) {
      const {value, done} = await reader.read();
      if (done) {
        for(const controller of this._controllers.values())
          controller.close();
        return;
      }
      for(const controller of this._controllers.values())
        controller.enqueue(value);
    }
    
  }
}

