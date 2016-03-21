export default class Utils {
  static isWorkerRuntime() {
    return !!self.importScripts;
  }
}
