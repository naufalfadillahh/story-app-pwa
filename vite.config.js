// vite.config.js
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      // Mendaftarkan Service Worker secara otomatis
      registerType: 'prompt',
      
      /**
       * Kriteria 3: Konfigurasi Manifest (Installable)
       * Ini akan membuat manifest.json untuk Anda.
       */
      manifest: {
        id: '/',
        start_url: '/',
        scope: '/',
        name: 'Dicoding Story',
        short_name: 'Story',
        description: 'Aplikasi untuk membagikan cerita keseharian Anda.',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3B82F6', // (Warna biru primer kita)
        icons: [
          // Pastikan Anda MEMBUAT file-file ini di /public/icons/
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          // Pastikan Anda MEMBUAT file ini di /public/screenshots/
          {
            src: 'screenshots/screenshot-1.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Halaman Utama Story App',
          },
        ],
        shortcuts: [
          {
            name: 'Beranda',
            url: '/#/',
            icons: [
              {
                src: 'icons/shortcut-icon-96.png',
                sizes: '96x96',
                type: 'image/png',
              },
            ],
          },
          {
            name: 'Tambah Cerita',
            url: '/#/add',
            icons: [
              {
                src: 'icons/shortcut-icon-96.png',
                sizes: '96x96',
                type: 'image/png',
              },
            ],
          },
        ],
      },

      /**
       * Konfigurasi Service Worker (Workbox)
       */
      workbox: {
        // (Kriteria 3) Cache semua aset utama (App Shell)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
        
        // (Kriteria 3 Advance) Cache data dari API
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/story-api\.dicoding\.dev\/v1\/stories/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'story-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
              },
            },
          },
        ],
        
        // (Kriteria 2 & 4) Impor skrip eksternal
        // PENTING: Pastikan 'idb.js' ada di folder /public
        importScripts: ['custom-sw.js', 'idb.js'],
      },
    }),
  ],
});