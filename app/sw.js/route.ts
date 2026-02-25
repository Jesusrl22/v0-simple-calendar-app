import { readFileSync } from "fs"
import { join } from "path"

export async function GET() {
  // Serve the full service worker from public/sw.js
  // This ensures the /sw.js route always returns the latest SW with
  // SCHEDULE_NOTIFICATIONS support and Web Push handling.
  let swContent: string
  try {
    swContent = readFileSync(join(process.cwd(), "public", "sw.js"), "utf-8")
  } catch {
    // Fallback minimal SW if file not found
    swContent = `
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || 'Recordatorio', {
        body: data.body || '',
        icon: '/icon-192.jpg',
        badge: '/icon-192.jpg',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        data: data,
      })
    );
  } catch {}
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      if (clients.openWindow) return clients.openWindow('/app/calendar');
    })
  );
});
`
  }

  return new Response(swContent, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Service-Worker-Allowed": "/",
    },
  })
}
