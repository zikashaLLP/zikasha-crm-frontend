// Service Worker for push notifications

self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  console.log('Push received:', data);
  

  const title = data.title || 'Followup Reminder';
  const options = {
    body: data.body || 'Your task is due in 10 minutes!',
    icon: '/icons/512.png',
    badge: '/icons/512.png',
    data: {
      taskId: data.inquiryId || null,
      url: data.url || '/'
    },
    actions: [
      {
        action: 'view',
        title: 'View Task'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
  };

  event.waitUntil(    
    self.registration.showNotification(
      title,
      options
    )
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});