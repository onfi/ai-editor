import { create } from 'zustand';
import { useFileStore } from './fileStore';
import { File } from '../types/index';

interface EditorState {
  content: string;
  currentFile: File | null;
  cursorPosition: number;
  selectedText: { start: number; end: number } | null;
  setContent: (content: string) => void;
  setCurrentFile: (file: File | null) => void;
  setCursorPosition: (position: number) => void;
  setSelectedText: (selection: { start: number; end: number } | null) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  content: '',
  currentFile: null,
  cursorPosition: 0,
  selectedText: null,
  setContent: (content) => {
    set({ content });
    const state = get();
    if (state.currentFile) {
      useFileStore.getState().updateFile(state.currentFile, { content });
    }
  },
  setCurrentFile: (file) => set({ currentFile: file }),
  setCursorPosition: (position) => set({ cursorPosition: position }),
  setSelectedText: (selection) => set({ selectedText: selection }),
}));