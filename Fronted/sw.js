// Service Worker for offline support
const CACHE_NAME = 'brightlearn-cache-v1';
const OFFLINE_URL = '/offline.html';

const STATIC_RESOURCES = [
    '/',
    '/index.html',
    '/css/brightlearn.css',
    '/css/lesson-viewer.css',
    '/css/interactive-elements.css',
    '/css/learning-analytics.css',
    '/css/adaptive-learning.css',
    '/js/brightlearn.js',
    '/js/lesson-templates.js',
    '/js/lesson-interactions.js',
    '/js/learning-analytics.js',
    '/js/adaptive-learning.js',
    '/js/assessment-manager.js',
    '/js/init.js',
    '/assets/icons/favicon.ico',
    '/assets/images/logo.png',
    OFFLINE_URL
];

// Install event - cache static resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_RESOURCES))
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(async response => {
                // Return cached response if available
                if (response) {
                    return response;
                }

                // Try network request
                try {
                    const networkResponse = await fetch(event.request);
                    
                    // Cache successful GET requests
                    if (event.request.method === 'GET' && networkResponse.status === 200) {
                        const cache = await caches.open(CACHE_NAME);
                        cache.put(event.request, networkResponse.clone());
                    }
                    
                    return networkResponse;
                } catch (error) {
                    // If offline and request is for a page
                    if (event.request.mode === 'navigate') {
                        return caches.match(OFFLINE_URL);
                    }
                    
                    throw error;
                }
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'sync-progress') {
        event.waitUntil(syncProgress());
    }
});

async function syncProgress() {
    try {
        const db = await openDatabase();
        const unsynced = await getUnsyncedData(db);
        
        if (unsynced.length === 0) {
            return;
        }

        await Promise.all(unsynced.map(async data => {
            try {
                await syncToServer(data);
                await markAsSynced(db, data.id);
            } catch (error) {
                console.error('Sync failed for item:', data.id, error);
            }
        }));
    } catch (error) {
        console.error('Progress sync failed:', error);
    }
}

// Handle push notifications
self.addEventListener('push', event => {
    const data = event.data.json();
    
    const options = {
        body: data.body,
        icon: '/assets/images/icon-192x192.png',
        badge: '/assets/images/badge.png',
        data: data.data
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then(clientList => {
                const hadClientOpen = clientList.some(client => {
                    if (client.url === event.notification.data.url) {
                        return client.focus();
                    }
                });

                if (!hadClientOpen) {
                    clients.openWindow(event.notification.data.url);
                }
            })
    );
});

// Periodic background sync for content updates
self.addEventListener('periodicsync', event => {
    if (event.tag === 'content-update') {
        event.waitUntil(updateContent());
    }
});

async function updateContent() {
    try {
        const response = await fetch('/api/content/updates');
        const updates = await response.json();
        
        if (updates.length > 0) {
            const cache = await caches.open(CACHE_NAME);
            await Promise.all(updates.map(async update => {
                const response = await fetch(update.url);
                await cache.put(update.url, response);
            }));
            
            // Notify clients about updates
            const clients = await self.clients.matchAll();
            clients.forEach(client => {
                client.postMessage({
                    type: 'content-updated',
                    updates: updates
                });
            });
        }
    } catch (error) {
        console.error('Content update failed:', error);
    }
}
