import { StateStorage } from 'zustand/middleware';

const DB_NAME = 'markdown-editor-db';
const DB_VERSION = 1;
const STORE_NAME = 'zustand-storage';

class IndexedDBStorage implements StateStorage {
  private db: IDBDatabase | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }

  async getItem(name: string): Promise<string | null> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      return new Promise((resolve, reject) => {
        const request = store.get(name);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const result = request.result;
          // Zustand persistは文字列を期待するので、オブジェクトの場合はJSONに変換
          if (result && typeof result === 'object') {
            resolve(JSON.stringify(result));
          } else {
            resolve(result || null);
          }
        };
      });
    } catch (error) {
      console.error('IndexedDB getItem error:', error);
      return null;
    }
  }

  async setItem(name: string, value: string): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      return new Promise((resolve, reject) => {
        // JSON文字列をオブジェクトとして保存を試行、失敗したら文字列のまま保存
        let dataToStore: any;
        try {
          dataToStore = JSON.parse(value);
        } catch {
          dataToStore = value;
        }
        
        const request = store.put(dataToStore, name);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('IndexedDB setItem error:', error);
    }
  }

  async removeItem(name: string): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      return new Promise((resolve, reject) => {
        const request = store.delete(name);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('IndexedDB removeItem error:', error);
    }
  }
}

export const indexedDBStorage = new IndexedDBStorage();