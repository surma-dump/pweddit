importScripts('require.js');

const version = '{{pkg.version}}';

self.addEventListener('install', event => {
  console.log(`Installing new ServiceWorker v${version}`);
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  console.log('Claiming clients...');
  event.waitUntil(self.clients.claim());
});

require(['modules/ServiceWorkerController'], ServiceWorkerController => {
  new ServiceWorkerController.default();
});
