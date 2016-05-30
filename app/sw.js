importScripts('require.js');

const version = '{{pkg.version}}';

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

require(['modules/ServiceWorkerController'], ServiceWorkerController => {
  new ServiceWorkerController.default();
});
