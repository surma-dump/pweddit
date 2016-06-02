importScripts('/system.js');

var version = '{{pkg.version}}';

self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});

System.config({
  scriptLoad: true
});

System.import('/modules/ServiceWorkerController.js')
  .then(function(ServiceWorkerController) {
    new ServiceWorkerController.default();
  });
