/**
 * Push Notification System
 *
 * Handles push notification subscription, sending, and receiving
 * for reminders, insights, and real-time updates.
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
}

/**
 * Check if push notifications are supported
 */
export function isPushNotificationSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Check notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isPushNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    console.warn('[PushNotifications] Push notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('[PushNotifications] Notification permission denied');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('[PushNotifications] Error requesting permission:', error);
    return false;
  }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) {
    return null;
  }

  try {
    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Create new subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      console.log('[PushNotifications] New subscription created');
    } else {
      console.log('[PushNotifications] Using existing subscription');
    }

    // Send subscription to server
    await sendSubscriptionToServer(subscription);

    return subscription;
  } catch (error) {
    console.error('[PushNotifications] Error subscribing:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      await removeSubscriptionFromServer(subscription);
      console.log('[PushNotifications] Unsubscribed successfully');
      return true;
    }

    return false;
  } catch (error) {
    console.error('[PushNotifications] Error unsubscribing:', error);
    return false;
  }
}

/**
 * Show local notification
 */
export async function showNotification(options: NotificationOptions): Promise<void> {
  if (!isPushNotificationSupported()) {
    console.warn('[PushNotifications] Notifications not supported');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn('[PushNotifications] Notification permission not granted');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    await registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon || '/icons/icon-192x192.png',
      badge: options.badge || '/icons/badge-72x72.png',
      ...(options.image && { image: options.image }),
      tag: options.tag,
      data: options.data,
      actions: options.actions,
      requireInteraction: options.requireInteraction || false,
      silent: options.silent || false,
      vibrate: [200, 100, 200],
      timestamp: Date.now()
    } as any);

    console.log('[PushNotifications] Notification shown:', options.title);
  } catch (error) {
    console.error('[PushNotifications] Error showing notification:', error);
  }
}

/**
 * Schedule a notification
 */
export async function scheduleNotification(
  options: NotificationOptions,
  scheduledTime: Date
): Promise<void> {
  const delay = scheduledTime.getTime() - Date.now();

  if (delay <= 0) {
    // Show immediately if time has passed
    await showNotification(options);
    return;
  }

  // Store in IndexedDB for persistence
  const notificationData = {
    ...options,
    scheduledTime: scheduledTime.toISOString()
  };

  // Set timeout (Note: this won't survive page refresh)
  // In production, use service worker's scheduled notifications API
  setTimeout(() => {
    showNotification(options);
  }, delay);

  console.log(`[PushNotifications] Notification scheduled for ${scheduledTime.toISOString()}`);
}

/**
 * Send subscription to server
 */
async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  try {
    const response = await fetch(`${apiUrl}/api/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });

    if (!response.ok) {
      throw new Error('Failed to send subscription to server');
    }

    console.log('[PushNotifications] Subscription sent to server');
  } catch (error) {
    console.error('[PushNotifications] Error sending subscription:', error);
  }
}

/**
 * Remove subscription from server
 */
async function removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  try {
    const response = await fetch(`${apiUrl}/api/push/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });

    if (!response.ok) {
      throw new Error('Failed to remove subscription from server');
    }

    console.log('[PushNotifications] Subscription removed from server');
  } catch (error) {
    console.error('[PushNotifications] Error removing subscription:', error);
  }
}

/**
 * Convert VAPID key to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Notification presets for common use cases
 */
export const NotificationPresets = {
  taskReminder: (taskTitle: string): NotificationOptions => ({
    title: 'Task Reminder',
    body: `Don't forget: ${taskTitle}`,
    icon: '/icons/shortcut-schedule.png',
    tag: 'task-reminder',
    actions: [
      { action: 'complete', title: 'Mark Complete' },
      { action: 'snooze', title: 'Snooze 15min' }
    ],
    requireInteraction: true
  }),

  dailyInsight: (insight: string): NotificationOptions => ({
    title: 'Daily Insight',
    body: insight,
    icon: '/icons/icon-192x192.png',
    tag: 'daily-insight',
    actions: [{ action: 'view', title: 'View Dashboard' }]
  }),

  syncComplete: (itemCount: number): NotificationOptions => ({
    title: 'Sync Complete',
    body: `Successfully synced ${itemCount} items`,
    icon: '/icons/icon-192x192.png',
    tag: 'sync-complete',
    silent: true
  }),

  budgetAlert: (category: string, percentage: number): NotificationOptions => ({
    title: 'Budget Alert',
    body: `${category} budget at ${percentage}%`,
    icon: '/icons/shortcut-financial.png',
    tag: 'budget-alert',
    actions: [{ action: 'view', title: 'View Details' }],
    requireInteraction: true
  }),

  workoutStreak: (days: number): NotificationOptions => ({
    title: 'Workout Streak! 🔥',
    body: `${days} days in a row! Keep it up!`,
    icon: '/icons/shortcut-health.png',
    tag: 'workout-streak',
    actions: [{ action: 'log', title: 'Log Workout' }]
  })
};

/**
 * React hook for push notifications
 */
export function usePushNotifications() {
  return {
    isSupported: isPushNotificationSupported(),
    permission: getNotificationPermission(),
    requestPermission: requestNotificationPermission,
    subscribe: subscribeToPushNotifications,
    unsubscribe: unsubscribeFromPushNotifications,
    show: showNotification,
    schedule: scheduleNotification
  };
}
