export default function mixinMemoize(f) {
  const wm = new WeakMap();
  return function(clazz) {
    if (wm.has(clazz)) {
      return wm.get(clazz);
    }
    const newClazz = f(clazz);
    wm.set(clazz, newClazz);
    return newClazz;
  }
}
