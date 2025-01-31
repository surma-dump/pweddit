export default function injectTransferHandler(Comlink) {
  Comlink.transferHandlers.set('EVENT', {
    canHandle(obj) {
      return obj instanceof Event;
    },
    serialize(obj) {
      return {
        targetId: obj && obj.target && obj.target.id,
        targetClassList: obj && obj.target && obj.target.classList && [...obj.target.classList],
        detail: obj && obj.detail,
      };
    },
    deserialize(obj) {
      return obj;
    },
  });
  return Comlink;
}
