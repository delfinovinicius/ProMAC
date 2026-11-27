/* ProMAC v3: sem cópia guardada. Existe só para que o service worker da raiz não controle esta pasta. */
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
