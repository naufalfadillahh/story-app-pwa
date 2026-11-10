# TODO: Implementasi Mode Offline untuk Aplikasi Story App

## Tujuan
Menerapkan penyimpanan cerita di IndexedDB sehingga aplikasi dapat menampilkan cerita yang sudah di-cache ketika offline, mirip dengan modul CityCare App.

## Langkah-langkah

### 1. Update IndexedDB Helper
- [x] Tambahkan store baru 'stories' di indexeddb-helper.js
- [x] Naikkan DB_VERSION ke 4
- [x] Tambahkan methods: saveStories(stories), getStories()

### 2. Update Home Presenter
- [x] Modifikasi home-presenter.js untuk menyimpan cerita ke IndexedDB setelah fetch berhasil dari API
- [x] Tambahkan fallback: Jika fetch dari API gagal (offline), ambil cerita dari IndexedDB
- [x] Update tampilan untuk menunjukkan status offline/online

### 3. Build dan Test
- [x] Jalankan `npm run build` untuk generate service worker baru
- [ ] Test aplikasi offline: Matikan koneksi internet, refresh halaman, pastikan cerita masih muncul

### 4. Verifikasi
- [ ] Pastikan manifest.json dan service worker sudah benar
- [ ] Test caching API dengan StaleWhileRevalidate
- [ ] Pastikan aplikasi bisa diinstall sebagai PWA

## Status
- [x] Analisis kode selesai
- [x] Update IndexedDB Helper selesai
- [x] Update Home Presenter selesai
- [ ] Build dan Test dimulai
