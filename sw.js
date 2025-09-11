const CACHE_NAME = 'our-minds-v2';
const STATIC_CACHE = 'our-minds-static-v2';
const DYNAMIC_CACHE = 'our-minds-dynamic-v2';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/assets/OurMinds.png',
  '/assets/default.png',
  '/icons/pwa-icon-192.png',
  '/icons/pwa-icon-512.jpg'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Skip waiting');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - smarter strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle same-origin GET requests
  if (request.method !== 'GET') return;
  if (!request.url.startsWith(self.location.origin)) return;

  // Network-first for navigations to avoid stale index.html
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Optionally cache a fresh offline fallback
          caches.open(STATIC_CACHE).then((cache) => {
            cache.match('/offline.html');
          });
          return response;
        })
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // Always go to network for JS and CSS to avoid stale chunks
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  // Cache-first for other assets (images, fonts, etc.) with dynamic fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseToCache));
          return response;
        })
        .catch(() => caches.match('/offline.html'));
    })
  );
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Skipping waiting');
    self.skipWaiting();
  }
});

// Handle background sync (for future offline functionality)
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Add background sync logic here if needed
      Promise.resolve()
    );
  }
});

// Handle push notifications (for future notification functionality)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/assets/icon-192x192.png',
    badge: '/assets/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'our-minds-notification',
    renotify: true,
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/assets/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/icon-72x72.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Our Minds', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url === self.location.origin + '/' && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Open new window if not already open
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
});