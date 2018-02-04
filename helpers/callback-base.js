export default function callbackBase(clazz) {
  return class extends clazz {
    connectedCallback() {}
    disconnectedCallback() {}
  }
}
