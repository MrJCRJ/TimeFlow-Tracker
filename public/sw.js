const CACHE_NAME = 'timeflow-v2'; // Incrementado para forçar novo cache
const urlsToCache = [
  '/',
  '/manifest.json',
];

// URLs das APIs antigas removidas - retornar erro imediatamente
const REMOVED_APIS = [
  '/api/today',
  '/api/insights',
  '/api/day-stats',
  '/api/pending-queue',
  '/api/flow',
  '/api/clear-data',
];

self.addEventListener('install', (event) => {
  // Força ativação imediata do novo service worker
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Não interceptar requisições de autenticação
  if (url.pathname.startsWith('/api/auth/')) {
    return; // Deixa passar sem cache
  }

  // Se for uma API removida, retorna 404 imediatamente sem tentar fazer fetch
  if (REMOVED_APIS.some(api => url.pathname === api)) {
    event.respondWith(
      new Response(
        JSON.stringify({
          error: 'API removida - use IndexedDB',
          message: 'Esta API foi migrada para IndexedDB. Os dados agora são armazenados localmente no navegador.'
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

self.addEventListener('activate', (event) => {
  // Assume controle imediato de todas as páginas
  event.waitUntil(
    clients.claim().then(() => {
      return caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      });
    })
  );
});

// Recebe mensagens do cliente, por exemplo para "skip waiting" e ativar nova versão imediatamente
self.addEventListener('message', (event) => {
  if (!event.data) return;
  const { type } = event.data;
  if (type === 'SKIP_WAITING') {
    console.log('🟢 SW: Recebeu SKIP_WAITING');
    self.skipWaiting();
  }
});
