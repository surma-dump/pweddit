import Utils from '/modules/Utils.js';

export default class Downloader {
  static downloadThreads() {
    if(Utils.isMainThread() && Utils.supportsServiceWorker() && Utils.supportsBgSync()) {
      return navigator.serviceWorker.ready
        .then(swRegistration => swRegistration.sync.register('downloadThreads'))
        .catch(err => {
          console.error('Could not register for background sync:', err);
        })
    }
    console.error('Not implemented yet');
  }

}
