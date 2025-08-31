import { useState, useEffect } from 'react';
import { 
  requestNotificationPermission, 
  subscribeToPushNotifications, 
  unsubscribeFromPushNotifications 
} from '@/utils/pushNotifications';

export function usePushNotifications(userId: number) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    // Check if push notifications are supported
    const supported = 'serviceWorker' in navigator && 
                     'PushManager' in window && 
                     'Notification' in window;
    
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, [userId]);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const subscribe = async () => {
    try {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        throw new Error('Notification permission denied');
      }

      await subscribeToPushNotifications(userId);
      setIsSubscribed(true);
      setPermission('granted');
    } catch (error) {
      console.error('Subscription failed:', error);
      throw error;
    }
  };

  const unsubscribe = async () => {
    try {
      await unsubscribeFromPushNotifications(userId);
      setIsSubscribed(false);
    } catch (error) {
      console.error('Unsubscribe failed:', error);
      throw error;
    }
  };

  return {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    unsubscribe
  };
}