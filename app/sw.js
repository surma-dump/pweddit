importScripts('js/require.js');

self.addEventListener('install', event => {
  console.log('Installing new ServiceWorker');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  console.log('Claiming clients...');
  event.waitUntil(self.clients.claim());
});

require(['js/ServiceWorkerController'], ServiceWorkerController => {
  new ServiceWorkerController.default();
});
