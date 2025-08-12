import { create } from 'zustand';
import type { File } from '../types/index';

interface FileState {
  files: File[];
  expandedFolders: Set<string>;
  addFile: (file: File) => void;
  updateFile: (fileId: string, updates: Partial<File>) => void;
  deleteFile: (fileId: string) => void;
  getFile: (fileId: string) => File | undefined;
  toggleFolder: (folderId: string) => void;
}

export const useFileStore = create<FileState>((set, get) => ({
  files: [],
  expandedFolders: new Set<string>(),
  
  addFile: (file) => set((state) => ({
    files: [...state.files, file]
  })),
  
  updateFile: (fileId, updates) => set((state) => ({
    files: state.files.map(file => 
      file.id === fileId 
        ? { ...file, ...updates, updatedAt: new Date() }
        : file
    )
  })),
  
  deleteFile: (fileId) => set((state) => {
    const deleteIds = new Set<string>();
    const findChildren = (id: string) => {
      deleteIds.add(id);
      state.files
        .filter(f => f.parentId === id)
        .forEach(f => findChildren(f.id));
    };
    findChildren(fileId);
    
    return {
      files: state.files.filter(f => !deleteIds.has(f.id))
    };
  }),
  
  getFile: (fileId) => {
    return get().files.find(f => f.id === fileId);
  },
  
  toggleFolder: (folderId) => set((state) => {
    const newExpanded = new Set(state.expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    return { expandedFolders: newExpanded };
  })
}));