import { create } from 'zustand';

interface EditorState {
  content: string;
  currentFileId: string | null;
  cursorPosition: number;
  selectedText: { start: number; end: number } | null;
  setContent: (content: string) => void;
  setCurrentFileId: (fileId: string | null) => void;
  setCursorPosition: (position: number) => void;
  setSelectedText: (selection: { start: number; end: number } | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  content: '',
  currentFileId: null,
  cursorPosition: 0,
  selectedText: null,
  setContent: (content) => set({ content }),
  setCurrentFileId: (fileId) => set({ currentFileId: fileId }),
  setCursorPosition: (position) => set({ cursorPosition: position }),
  setSelectedText: (selection) => set({ selectedText: selection }),
}));