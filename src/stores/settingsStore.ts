import { create } from 'zustand';
import type { Settings } from '../types/index';

interface SettingsState extends Settings {
  currentView: 'editor' | 'preview' | 'fileTree';
  setGeminiApiKey: (key: string) => void;
  setAutoSaveInterval: (interval: number) => void;
  setCurrentView: (view: 'editor' | 'preview' | 'fileTree') => void;
}

const DB_NAME = 'markdown-editor-settings';
const DB_VERSION = 1;
const STORE_NAME = 'settings';

class SettingsDatabase {
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

  async saveSettings(settings: Omit<SettingsState, 'setGeminiApiKey' | 'setAutoSaveInterval' | 'setCurrentView'>): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put(settings, 'settings');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  async loadSettings(): Promise<Omit<SettingsState, 'setGeminiApiKey' | 'setAutoSaveInterval' | 'setCurrentView'> | null> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      return new Promise((resolve, reject) => {
        const request = store.get('settings');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || null);
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      return null;
    }
  }
}

const settingsDB = new SettingsDatabase();

const initializeSettings = async (): Promise<Partial<SettingsState>> => {
  const savedSettings = await settingsDB.loadSettings();
  if (savedSettings) {
    return savedSettings;
  }
  return {
    geminiApiKey: '',
    autoSaveInterval: 60000,
    currentView: 'editor'
  };
};

export const useSettingsStore = create<SettingsState>()((set, get) => {
  // 初期化
  initializeSettings().then(initialSettings => {
    set(initialSettings);
  });

  const saveSettings = () => {
    const state = get();
    const { setGeminiApiKey, setAutoSaveInterval, setCurrentView, ...settings } = state;
    settingsDB.saveSettings(settings);
  };

  return {
    geminiApiKey: '',
    autoSaveInterval: 60000,
    currentView: 'editor',
    setGeminiApiKey: (key) => {
      set({ geminiApiKey: key });
      setTimeout(saveSettings, 0);
    },
    setAutoSaveInterval: (interval) => {
      set({ autoSaveInterval: interval * 1000 });
      setTimeout(saveSettings, 0);
    },
    setCurrentView: (view) => {
      set({ currentView: view });
      setTimeout(saveSettings, 0);
    },
  };
});