// src/api/story-api.js
const API_BASE_URL = 'https://story-api.dicoding.dev/v1';

const getToken = () => localStorage.getItem('authToken');

class StoryApi {
  static async register({ name, email, password }) {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.message);
    return data;
  }

  static async login({ email, password }) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.message);
    return data;
  }

  static async getAllStories() {
    const token = getToken();
    if (!token) throw new Error('Anda harus login dulu');
    const response = await fetch(`${API_BASE_URL}/stories?location=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (data.error) throw new Error(data.message);
    return data.listStory || [];
  }

  static async postStory(formData) {
    const token = getToken();
    if (!token) throw new Error('Anda harus login dulu');
    const response = await fetch(`${API_BASE_URL}/stories`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await response.json();
    if (data.error) throw new Error(data.message);
    return data;
  }

  static async subscribePushNotification(subscription) {
    const token = getToken();
    if (!token) throw new Error('Anda harus login dulu');
    const response = await fetch(`${API_BASE_URL}/notifications/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.toJSON().keys.p256dh,
          auth: subscription.toJSON().keys.auth,
        },
      }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.message);
    return data;
  }

  static async unsubscribePushNotification(subscription) {
    const token = getToken();
    if (!token) throw new Error('Anda harus login dulu');
    const response = await fetch(`${API_BASE_URL}/notifications/subscribe`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.message);
    return data;
  }
}
export default StoryApi;