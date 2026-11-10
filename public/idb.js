(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.idb = {}));
})(this, (function (exports) { 'use strict';

  const READONLY = 'readonly';
  const READWRITE = 'readwrite';
  const VERSIONCHANGE = 'versionchange';

  const ObjectStore = 'objectStore';
  const Index = 'index';
  const Cursor = 'cursor';

  function promisify(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function idbOpen(dbName, version, upgradeCallback) {
    const request = indexedDB.open(dbName, version);
    request.onupgradeneeded = (event) => {
      upgradeCallback(event.target.result, event.oldVersion, event.newVersion, event.target.transaction);
    };
    return promisify(request);
  }

  function idbDelete(dbName, options = {}) {
    const request = indexedDB.deleteDatabase(dbName);
    if (options.blocked) {
      request.onblocked = options.blocked;
    }
    return promisify(request);
  }

  class IDBWrapper {
    constructor(db) {
      this.db = db;
    }

    transaction(storeNames, mode = READONLY) {
      return new IDBTransactionWrapper(this.db.transaction(storeNames, mode));
    }

    close() {
      this.db.close();
    }

    get objectStoreNames() {
      return this.db.objectStoreNames;
    }

    get name() {
      return this.db.name;
    }

    get version() {
      return this.db.version;
    }
  }

  class IDBTransactionWrapper {
    constructor(transaction) {
      this.transaction = transaction;
    }

    objectStore(name) {
      return new IDBObjectStoreWrapper(this.transaction.objectStore(name));
    }

    get mode() {
      return this.transaction.mode;
    }

    get db() {
      return this.transaction.db;
    }

    get objectStoreNames() {
      return this.transaction.objectStoreNames;
    }

    abort() {
      this.transaction.abort();
    }

    get done() {
      return new Promise((resolve, reject) => {
        this.transaction.oncomplete = () => resolve();
        this.transaction.onerror = () => reject(this.transaction.error);
        this.transaction.onabort = () => reject(new Error('Transaction aborted'));
      });
    }
  }

  class IDBObjectStoreWrapper {
    constructor(objectStore) {
      this.objectStore = objectStore;
    }

    add(value, key) {
      return promisify(this.objectStore.add(value, key));
    }

    put(value, key) {
      return promisify(this.objectStore.put(value, key));
    }

    get(key) {
      return promisify(this.objectStore.get(key));
    }

    getAll(query, count) {
      return promisify(this.objectStore.getAll(query, count));
    }

    getAllKeys(query, count) {
      return promisify(this.objectStore.getAllKeys(query, count));
    }

    delete(key) {
      return promisify(this.objectStore.delete(key));
    }

    clear() {
      return promisify(this.objectStore.clear());
    }

    count(key) {
      return promisify(this.objectStore.count(key));
    }

    index(name) {
      return new IDBIndexWrapper(this.objectStore.index(name));
    }

    createIndex(name, keyPath, options) {
      return this.objectStore.createIndex(name, keyPath, options);
    }

    deleteIndex(name) {
      this.objectStore.deleteIndex(name);
    }

    openCursor(range, direction) {
      return new IDBCursorWrapper(this.objectStore.openCursor(range, direction));
    }

    openKeyCursor(range, direction) {
      return new IDBCursorWrapper(this.objectStore.openKeyCursor(range, direction));
    }

    get name() {
      return this.objectStore.name;
    }

    get keyPath() {
      return this.objectStore.keyPath;
    }

    get indexNames() {
      return this.objectStore.indexNames;
    }

    get autoIncrement() {
      return this.objectStore.autoIncrement;
    }
  }

  class IDBIndexWrapper {
    constructor(index) {
      this.index = index;
    }

    get(key) {
      return promisify(this.index.get(key));
    }

    getAll(query, count) {
      return promisify(this.index.getAll(query, count));
    }

    getAllKeys(query, count) {
      return promisify(this.index.getAllKeys(query, count));
    }

    count(key) {
      return promisify(this.index.count(key));
    }

    get name() {
      return this.index.name;
    }

    get keyPath() {
      return this.index.keyPath;
    }

    get multiEntry() {
      return this.index.multiEntry;
    }

    get unique() {
      return this.index.unique;
    }
  }

  class IDBCursorWrapper {
    constructor(cursorRequest) {
      this.cursorRequest = cursorRequest;
      this.cursor = null;
      cursorRequest.onsuccess = () => {
        this.cursor = cursorRequest.result;
      };
    }

    async *iterate(range, direction) {
      const request = this.cursorRequest;
      let cursor = await promisify(request);
      while (cursor) {
        yield cursor;
        cursor = await new Promise((resolve) => {
          cursor.continue();
          request.onsuccess = () => resolve(request.result);
        });
      }
    }

    get key() {
      return this.cursor?.key;
    }

    get primaryKey() {
      return this.cursor?.primaryKey;
    }

    get value() {
      return this.cursor?.value;
    }

    get direction() {
      return this.cursor?.direction;
    }

    update(value) {
      return promisify(this.cursor.update(value));
    }

    delete() {
      return promisify(this.cursor.delete());
    }

    continue(key) {
      this.cursor.continue(key);
    }

    continuePrimaryKey(key, primaryKey) {
      this.cursor.continuePrimaryKey(key, primaryKey);
    }

    advance(count) {
      this.cursor.advance(count);
    }
  }

  function openDB(dbName, version, options = {}) {
    return idbOpen(dbName, version, options.upgrade).then(db => new IDBWrapper(db));
  }

  function deleteDB(dbName, options) {
    return idbDelete(dbName, options);
  }

  exports.openDB = openDB;
  exports.deleteDB = deleteDB;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
