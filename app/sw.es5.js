importScripts('/system.js');

var version = '{{pkg.version}}';

self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});

System.config({
  meta: {
    '*': {
      // Use <script> or importScripts() to load scripts rather than fetch()
      scriptLoad: true
    }
  }
});

System.import('/modules/ServiceWorkerController.js')
  .then(function(ServiceWorkerController) {
    new ServiceWorkerController.default();
  });
