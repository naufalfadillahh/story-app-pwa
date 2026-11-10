// public/custom-sw.js

/**
 * PENTING: Impor 'idb.js' (library IndexedDB)
 * Pastikan Anda sudah meletakkan file idb.js di folder /public
 */
try {
  importScripts('idb.js');
} catch (e) {
  console.error('Failed to import idb.js. Sync and DB features will fail.', e);
}

// --- Konfigurasi Database ---
// Pastikan nama dan versi ini SAMA PERSIS dengan di src/utils/indexeddb-helper.js
const DB_NAME = 'story-app-db';
const OUTBOX_STORE_NAME = 'story_outbox';
const TOKEN_STORE_NAME = 'auth_token';
const DB_VERSION = 3; // Versi 3 untuk 'favorites', 'story_outbox', 'auth_token'

// ==========================================================
// Kriteria 2: Menerapkan Push Notification
// ==========================================================

/**
 * Listener untuk menerima push message dari server
 * (Kriteria 2 Basic & Skilled)
 */
self.addEventListener('push', (event) => {
  console.log('Service worker: Push event received.');
  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: 'Notifikasi Baru', options: { body: event.data.text() } };
  }

  const title = data.title;
  const options = {
    body: data.options.body,
    icon: 'icons/icon-192x192.png', // Pastikan path ini benar
    badge: 'icons/icon-192x192.png', // Pastikan path ini benar
    data: {
      // Menyimpan URL untuk 'notificationclick'
      url: data.options.url || '/',
    },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

/**
 * Listener untuk menangani klik pada notifikasi
 * (Kriteria 2 Advance)
 */
self.addEventListener('notificationclick', (event) => {
  console.log('Service worker: Notification click received.');
  event.notification.close();
  
  // Ambil URL dari data notifikasi
  const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;

  // Cek apakah tab dengan URL ini sudah terbuka
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      // Cari tab yang sudah terbuka
      const hadWindowToFocus = clientsArr.some((windowClient) =>
        windowClient.url === urlToOpen ? (windowClient.focus(), true) : false,
      );

      // Jika tidak ada tab yang terbuka, buka tab baru
      if (!hadWindowToFocus) {
        clients
          .openWindow(urlToOpen)
          .then((windowClient) => (windowClient ? windowClient.focus() : null));
      }
    }),
  );
});

// ==========================================================
// Kriteria 4: Penerapan IndexedDB (Background Sync)
// ==========================================================

/**
 * Listener untuk sinkronisasi latar belakang
 * (Kriteria 4 Advance)
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-new-stories') {
    console.log('Service worker: Sync event received for "sync-new-stories".');
    event.waitUntil(syncStories());
  }
});

/**
 * Fungsi utama untuk sinkronisasi
 */
async function syncStories() {
  console.log('Syncing new stories...');
  try {
    const token = await getTokenFromDB();
    if (!token) throw new Error('Sync failed: No auth token found.');

    const stories = await getOutboxStories();
    if (stories.length === 0) {
      console.log('No stories to sync.');
      return;
    }

    // Kirim setiap cerita satu per satu
    for (const story of stories) {
      await postStoryToServer(story, token);
    }
    console.log('Sync complete.');
  } catch (error) {
    console.error('Error during sync:', error);
    // Kita tidak me-throw error lagi agar sync bisa dicoba kembali nanti
  }
}

/**
 * Mengirim satu cerita ke server dan menghapusnya dari outbox
 */
async function postStoryToServer(story, token) {
  const formData = new FormData();
  formData.append('description', story.description);
  // 'story.photo' HARUS berupa Blob
  formData.append('photo', story.photo, story.photo.name || 'synced-story.jpg');
  if (story.lat) formData.append('lat', story.lat);
  if (story.lon) formData.append('lon', story.lon);

  const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (data.error) {
    // Jika gagal, biarkan di outbox untuk dicoba lagi nanti
    throw new Error(`Failed to post story ${story.id}: ${data.message}`);
  }

  // 4. Jika berhasil, hapus dari 'story_outbox'
  console.log(`Successfully synced story (IDB ID: ${story.id}), deleting from outbox...`);
  await deleteOutboxStory(story.id); // 'story.id' adalah primary key
}

// --- Helper IndexedDB untuk Service Worker ---
// (Kita tidak bisa mengimpor modul, jadi kita definisikan ulang di sini)

function openAppDB() {
  // Cek apakah 'idb' berhasil diimpor
  if (!self.idb) {
    console.error('IDB library (idb.js) not loaded. Sync will fail.');
    return null;
  }
  return self.idb.openDB(DB_NAME, DB_VERSION);
}

async function getTokenFromDB() {
  const db = await openAppDB();
  if (!db) return null;
  // Asumsi Anda menyimpan token sebagai { id: 'authToken', token: '...' }
  const tokenObject = await db.get(TOKEN_STORE_NAME, 'authToken');
  return tokenObject ? tokenObject.token : null;
}

async function getOutboxStories() {
  const db = await openAppDB();
  if (!db) return [];
  return db.getAll(OUTBOX_STORE_NAME);
}

async function deleteOutboxStory(key) {
  const db = await openAppDB();
  if (!db) return;
  return db.delete(OUTBOX_STORE_NAME, key);
}