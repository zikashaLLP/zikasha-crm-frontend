import api from "@/api/axios";

// Convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Request notification permission
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Register service worker and subscribe to push notifications
export async function subscribeToPushNotifications(userId: number) {
  try {
    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);

    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;

    // Check if push messaging is supported
    if (!('PushManager' in window)) {
      throw new Error('Push messaging not supported');
    }

    // Get existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Create new subscription
      const vapidPublicKey = 'BDhp8BMZThCSDJVoPRVPCKtCQd3-EkcbD-16jg9e128eqDQkrXa_dgK3LIm2UpUGNXqTmWxqi_Op1zMEJVl_3Fc'; // Replace with your VAPID key
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });
    }

    // Send subscription to backend
    await api.post('/notifications/subscribe', {
        userId: userId,
        subscription: subscription,
    });

    return subscription;

  } catch (error) {
    console.error('Push subscription failed:', error);
    throw error;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPushNotifications(userId: number) {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        
        // Notify backend
        await api.post('/notifications/unsubscribe', {userId});
      }
    }
  } catch (error) {
    console.error('Unsubscribe failed:', error);
  }
}
