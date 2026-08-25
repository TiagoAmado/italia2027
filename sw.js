const CACHE_NAME = 'roteiro-italia-v39';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './data.js',
  './calendar.js',
  './trip-time.js',
  './app.js',
  './manifest.json',
  './icons/icon.svg'
];

self.addEventListener('install', (event)=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event)=>{
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event)=>{
  const req = event.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);

  if(url.origin === self.location.origin){
    // App shell: cache-first. Só navegações caem no HTML; um asset ausente nunca recebe index.html.
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res => {
        if(res.ok){
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return res;
      })).catch(err => {
        if(req.mode === 'navigate') return caches.match('./index.html');
        throw err;
      })
    );
    return;
  }

  if(url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')){
    // Fontes do Google: stale-while-revalidate (mostra a versão em cache, atualiza em segundo plano)
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(req).then(cached => {
          const fetchPromise = fetch(req).then(res => {
            cache.put(req, res.clone());
            return res;
          }).catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
  }
});
