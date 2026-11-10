// src/utils/notification-helper.js
import StoryApi from '../api/story-api.js';

const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const NotificationHelper = {
  async init() {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Browser ini tidak mendukung notifikasi.');
      return;
    }
    if (Notification.permission === 'default') {
      await this.requestPermission();
    } else if (Notification.permission === 'granted') {
      await this.checkSubscription();
    } else {
      alert('Anda telah memblokir izin notifikasi.');
    }
  },

  async requestPermission() {
    const result = await Notification.requestPermission();
    if (result === 'granted') {
      await this.subscribe();
    }
  },

  async checkSubscription() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      if (confirm('Anda sudah berlangganan. Apakah Anda ingin berhenti?')) {
        await this.unsubscribe(subscription);
      }
    } else {
      await this.subscribe();
    }
  },

  async subscribe() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      await StoryApi.subscribePushNotification(subscription);
      alert('Berhasil mengaktifkan notifikasi!');
    } catch (error) {
      console.error('Gagal subscribe:', error);
    }
  },

  async unsubscribe(subscription) {
    try {
      await subscription.unsubscribe();
      await StoryApi.unsubscribePushNotification(subscription);
      alert('Berhasil menonaktifkan notifikasi!');
    } catch (error) {
      console.error('Gagal unsubscribe:', error);
    }
  },
};
export default NotificationHelper;