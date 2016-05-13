export default function() {
  if(typeof self._contentHandlerRegistry === 'undefined')
    self._contentHandlerRegistry = new ContentHandlerRegistry()
  return self._contentHandlerRegistry;
}

class ContentHandlerRegistry {
  constructor() {
    this.handlers = new Set();
  }

  register(handler) {
    this.handlers.add(handler);
  }

  handleLink(url) {
    if(!(url instanceof URL) && !(typeof url === 'string'))
      throw 'handleLink()) expects a URL or a string';
    if(typeof url === 'string')
      url = new URL(url);

    return handlers
      .filter(handler => handler.canHandle(url))
      // Find the first handler that doesn’t return `null`
      .reduce((prev, handler) => {
        if(prev !== null) {
          return prev;
        }
        return handler.handle(url);
      }, null);
  }

}
