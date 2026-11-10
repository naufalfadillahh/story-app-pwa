// public/push-sw.js

// ==============================
// 🔔 Kriteria 2 Skilled: Notifikasi Dinamis
// ==============================
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title || 'Notifikasi Baru';
  const options = {
    body: data.options?.body || 'Anda memiliki notifikasi baru!',
    icon: 'icons/icon-192x192.png',
    badge: 'icons/icon-192x192.png',
    data: data.options?.url || '/', // bisa digunakan saat diklik
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ==============================
// 🖱️ Kriteria 2 Advance: Action Klik Notifikasi
// ==============================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data || '/#/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// ==============================
// 🔄 Background Sync Handler
// ==============================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-new-stories') {
    event.waitUntil(syncStories());
  }
});

// ==============================
// ⚙️ Fungsi Sinkronisasi Offline Stories
// ==============================
async function syncStories() {
  console.log('Syncing new stories...');

  try {
    // Pastikan IDB tersedia
    const db = await openDB('favorite-story-db', 1);
    const tx = db.transaction('story_outbox', 'readwrite');
    const store = tx.objectStore('story_outbox');
    const allStories = await store.getAll();

    for (const story of allStories) {
      try {
        // Kirim data ke server (pastikan API endpoint benar)
        await fetch('https://your-api-endpoint.com/stories', {
          method: 'POST',
          body: story, // jika formData disimpan, ini akan bekerja
        });

        // Hapus dari outbox jika berhasil terkirim
        await store.delete(story.id);
        console.log(`✅ Story "${story.id}" berhasil disinkronkan`);
      } catch (err) {
        console.error(`❌ Gagal mengirim story ${story.id}:`, err);
      }
    }

    await tx.done;
  } catch (error) {
    console.error('Gagal melakukan syncStories:', error);
  }
}

// ==============================
// 🧩 Utilitas: openDB sederhana (tanpa import idb)
// ==============================
function openDB(name, version) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}
