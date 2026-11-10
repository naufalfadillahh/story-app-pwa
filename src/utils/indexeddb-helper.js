// src/utils/indexeddb-helper.js
import { openDB } from 'idb';

const DB_NAME = 'story-app-db';
const DB_VERSION = 4; // Naikkan versi untuk store baru 'stories'

const FAVORITES_STORE = 'favorites';
const OUTBOX_STORE = 'story_outbox';
const TOKEN_STORE = 'auth_token';
const STORIES_STORE = 'stories'; // Store baru untuk cache cerita offline

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db, oldVersion) {
    if (oldVersion < 1) {
      db.createObjectStore(FAVORITES_STORE, { keyPath: 'id' });
    }
    if (oldVersion < 2) {
      // (Kriteria 4 Advance)
      db.createObjectStore(OUTBOX_STORE, { keyPath: 'id', autoIncrement: true });
    }
    if (oldVersion < 3) {
      // (Kriteria 4 Advance)
      db.createObjectStore(TOKEN_STORE, { keyPath: 'id' });
    }
    if (oldVersion < 4) {
      // Store baru untuk cache cerita offline
      db.createObjectStore(STORIES_STORE, { keyPath: 'id' });
    }
  },
});

class FavoriteStoryDB {
  // --- FAVORITES (Kriteria 4 Basic) ---
  static async addStory(story) {
    return (await dbPromise).add(FAVORITES_STORE, story);
  }
  static async getAllStories() {
    return (await dbPromise).getAll(FAVORITES_STORE);
  }
  static async deleteStory(id) {
    return (await dbPromise).delete(FAVORITES_STORE, id);
  }

  // --- AUTH TOKEN (Kriteria 4 Advance) ---
  static async saveAuthToken(token) {
    return (await dbPromise).put(TOKEN_STORE, { id: 'authToken', token: token });
  }
  static async deleteAuthToken() {
    return (await dbPromise).delete(TOKEN_STORE, 'authToken');
  }

  // --- STORY CACHE (Offline Mode) ---
  static async saveStories(stories) {
    const db = await dbPromise;
    const tx = db.transaction(STORIES_STORE, 'readwrite');
    // Clear existing stories
    await tx.store.clear();
    // Add new stories
    for (const story of stories) {
      await tx.store.put(story);
    }
    await tx.done;
  }

  static async getStories() {
    return (await dbPromise).getAll(STORIES_STORE);
  }

  // --- STORY OUTBOX (Kriteria 4 Advance) ---
  static async addStoryToOutbox(story) {
    return (await dbPromise).add(OUTBOX_STORE, story);
  }
}

export default FavoriteStoryDB;
