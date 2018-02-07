export default function injectTransferHandler(Comlink) {
  Comlink.transferHandlers.set('FUNCTION', {
    canHandle(obj) {
      return obj instanceof Function;
    },
    serialize(obj) {
      const {port1, port2} = new MessageChannel();
      Comlink.expose(obj, port1);
      return port2;
    },
    deserialize(obj) {
      return Comlink.proxy(obj);
    },
  });
  return Comlink;
}
