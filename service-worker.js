const CACHE_NAME = 'game-cache-v1'; // Updated cache version
const urlsToCache = [
  '/game/snake.html',
  '/game/snake.css',
  '/game/snake.js',
  '/game/audio/eat.mp3',
  '/game/audio/gameover.mp3',
  '/game/gamee.png'
];

// Install event - cache the assets
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the new service worker to take control immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event - always try to fetch the latest content first, fallback to cache if network fails
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Check if we received a valid response (status 200 and type 'basic')
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response; // If invalid, don't cache
        }

        // Clone and cache the response if it's valid
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Return cached index.html if network fails
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || caches.match('/game/snake.html');
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME]; // Keep the latest cache version
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName); // Delete outdated caches
          }
        })
      );
    })
  );
});
