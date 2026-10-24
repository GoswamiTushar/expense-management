// Service Worker for Ledger OS Notifications
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming push messages
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = { title: 'Ledger Notification', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Ledger';
  const options = {
    body: data.body || 'You have a new update in Ledger.',
    icon: '/icon-192.png',
    badge: '/favicon.png',
    vibrate: [150, 80, 150],
    data: data.data || {},
    tag: data.tag || 'ledger-alert',
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification tap to focus/open the app window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
