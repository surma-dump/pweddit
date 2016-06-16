importScripts('/system.js');

var version = '{{pkg.version}}';

self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});

// SystemJS only supports SystemJS- and AMD modules in worker scopes. So let’s
// hack support for globals, which we need for idb.js
const oldFetch = System.fetch;
System.fetch = function(load) {
  if(load.metadata.scriptLoad && load.metadata.format === 'global' /* && thisIsAWorker */) {
    importScripts(load.address);
    load.metadata.entry = self[load.metadata.exports];
    return Promise.resolve('');
  }
  return oldFetch.call(this, load);
};

System.config({{{json config.SYSTEMJS_CONFIG}}});
System.import('/modules/ServiceWorkerController.js')
  .then(function(ServiceWorkerController) {
    // TODO remove me
    self._swc = new ServiceWorkerController.default();
  });
