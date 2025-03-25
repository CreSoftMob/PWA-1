const CACHE_NAME = 'meu-pwa-cache-v1';
const urlsToCache = [
  '/',
  'PWA-1/index.html',
  'PWA-1/styles.css',
  'PWA-1/icons/1.jpeg', // Removido duplicado
];

// Instalando o Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache); // Adicionando todos os recursos ao cache
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
            return caches.delete(cacheName); // Deleta caches antigos
          }
        })
      );
    })
  );
});

// Fetch (recolher dados do cache se offline)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request) // Verificando se o recurso está no cache
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse; // Se o recurso estiver no cache, retorna o cache
        }
        return fetch(event.request) // Caso contrário, faz a requisição normal
          .then((response) => {
            // Cacheia a resposta para futuras requisições, caso o recurso não esteja no cache
            if (event.request.url.startsWith(self.location.origin)) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, response.clone());
              });
            }
            return response;
          });
      })
      .catch((error) => {
        console.log('Erro ao buscar do cache ou fazer requisição:', error);
        return caches.match('PWA-1/index.html'); // Retorna uma página de fallback caso falhe
      })
  );
});
