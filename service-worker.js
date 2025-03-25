const CACHE_NAME = 'meu-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/icons/1.jpeg',
  '/manifest.json',
  '/offline.html', // Adicionando a página offline ao cache

];

// Instalando o Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache); // Adicionando os arquivos ao cache
      })
  );
});

// Ativando o Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName); // Deletar caches antigos
          }
        })
      );
    })
  );
});

// Fetch (Buscar dados do cache ou da rede)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse; // Retorna recurso do cache
        }
        return fetch(event.request) // Se não estiver no cache, faz a requisição de rede
          .then((response) => {
            if (event.request.url.startsWith(self.location.origin)) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, response.clone()); // Cacheia o recurso
              });
            }
            return response;
          });
      })

      .catch(() => {
        console.log('Erro ao buscar o recurso, usando fallback.');
        return caches.match('/offline.html'); // Retorna a página offline caso ocorra erro

      })
  );
});
