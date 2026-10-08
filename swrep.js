/* Reppets: carga rápido aunque la señal sea mala y funciona sin internet con la última versión descargada */
const CACHE = "reppets-v2";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n))))); self.clients.claim(); });
function fromCache(req) { return caches.match(req, { ignoreSearch: true }).then(m => m || caches.match("index.html")); }
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const net = fetch(req).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req.mode === "navigate" ? "index.html" : req, copy)); } return r; });
  /* Si la red tarda más de 3.5 s (señal débil), se muestra la copia guardada y la nueva se guarda para la próxima vez */
  const timeout = new Promise(res => setTimeout(() => fromCache(req).then(m => m && res(m)), 3500));
  e.respondWith(Promise.race([net.catch(() => fromCache(req)), timeout]).then(r => r || fromCache(req)));
  e.waitUntil(net.catch(() => {}));
});
