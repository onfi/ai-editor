import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings } from '../types/index';

interface SettingsState extends Settings {
  currentView: 'editor' | 'preview' | 'fileTree';
  setGeminiApiKey: (key: string) => void;
  setAutoSaveInterval: (interval: number) => void;
  setCurrentView: (view: 'editor' | 'preview' | 'fileTree') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      geminiApiKey: '',
      autoSaveInterval: 60000, // 1分
      currentView: 'editor',
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
      setAutoSaveInterval: (interval) => set({ autoSaveInterval: interval }),
      setCurrentView: (view) => set({ currentView: view }),
    }),
    {
      name: 'markdown-editor-settings',
    }
  )
);