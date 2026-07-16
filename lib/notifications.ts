// lib/notifications.ts
// Helpers for Web Push subscription management and local notifications

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

/**
 * Converts a VAPID base64 public key to a Uint8Array for pushManager.subscribe()
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

/**
 * Requests notification permission from the user.
 * Returns 'granted' | 'denied' | 'default'
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  return Notification.requestPermission();
}

/**
 * Subscribes the browser to Web Push and returns the PushSubscription object.
 * Returns null if not supported or permission is denied.
 */
export async function subscribeToPush(
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  if (!("PushManager" in window)) return null;
  if (!VAPID_PUBLIC_KEY) {
    console.warn("[JiroRano] NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set.");
    return null;
  }

  try {
    const existing = await registration.pushManager.getSubscription();
    if (existing) return existing;

    return await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  } catch (err) {
    console.error("[JiroRano] Push subscription failed:", err);
    return null;
  }
}

/**
 * Shows a local notification via the service worker (works in foreground & background).
 */
export async function showLocalNotification(
  registration: ServiceWorkerRegistration,
  title: string,
  options?: NotificationOptions
) {
  if (Notification.permission !== "granted") return;
  await registration.showNotification(title, {
    icon: "/icon-192.png",
    badge: "/badge-72.png",
    vibrate: [200, 100, 200],
    ...options,
  });
}

/**
 * Sends the push subscription endpoint to our API to store it server-side.
 */
export async function saveSubscription(subscription: PushSubscription): Promise<void> {
  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription.toJSON()),
  });
}
