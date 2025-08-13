import { create } from 'zustand';
import { File, type SerializedFile, type FileStateData } from '../types/index';

interface FileState {
  rootFile: File;
  expandedFolders: Set<File>;
  isLoaded: boolean; // 追加
  addFile: (file: Omit<File, 'parent' | 'getPath'>, parentPath?: string) => void;
  updateFile: (file: File, updates: Partial<Omit<File, 'parent' | 'children' | 'getPath'>>) => void;
  deleteFile: (file: File) => void;
  getFile: (path: string) => File | undefined;
  moveFile: (file: File, newParentPath: string) => void;
  toggleFolder: (folder: File) => void;
}

const createInitialRoot = (): File => {
  return new File({
    name: 'root',
    content: '',
    type: 'directory'
  });
};

const findFileByPath = (rootFile: File, path: string): File | undefined => {
  if (path === '' || path === '/' || path === 'root') return rootFile;
  
  const parts = path.split('/').filter(Boolean);
  let current = rootFile;
  
  for (const part of parts) {
    if (!current.children || !current.children[part]) {
      return undefined;
    }
    current = current.children[part];
  }
  
  return current;
};

const updateFileInTree = (rootFile: File, targetFile: File, updates: Partial<File>): File => {
  const updateRecursive = (file: File): File => {
    if (file === targetFile) {
      const oldName = file.name;
      Object.assign(file, updates);
      file.updatedAt = new Date();
      
      if (updates.name && updates.name !== oldName && file.parent && file.parent.children) {
        delete file.parent.children[oldName];
        file.parent.children[updates.name] = file;
      }
      
      return file;
    }
    
    if (file.children) {
      Object.values(file.children).forEach(child => updateRecursive(child));
    }
    
    return file;
  };
  
  return updateRecursive(rootFile);
};

const deleteFileFromTree = (rootFile: File, targetFile: File): File => {
  if (targetFile.parent && targetFile.parent.children) {
    delete targetFile.parent.children[targetFile.name];
  }
  return rootFile;
};


const DB_NAME = 'markdown-editor-files';
const DB_VERSION = 1;
const STORE_NAME = 'file-tree';

class FileDatabase {
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

  async saveState(rootFile: File, expandedFolders: Set<File>): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const expandedPaths = Array.from(expandedFolders).map(folder => folder.getPath());
      
      const data = {
        rootFile: this.serializeFileForStorage(rootFile),
        expandedPaths
      };
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put(data, 'state');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('Failed to save file state:', error);
    }
  }

  async loadState(): Promise<{ rootFile: File; expandedFolders: Set<File> } | null> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      const data = await new Promise<FileStateData | undefined>((resolve, reject) => {
        const request = store.get('state');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
      
      if (!data) return null;
      
      const rootFile = this.deserializeFileFromStorage(data.rootFile);
      const expandedFolders = new Set<File>();
      
      data.expandedPaths.forEach((path: string) => {
        const file = findFileByPath(rootFile, path);
        if (file && file.type === 'directory') {
          expandedFolders.add(file);
        }
      });
      
      return { rootFile, expandedFolders };
    } catch (error) {
      console.error('Failed to load file state:', error);
      return null;
    }
  }

  private serializeFileForStorage(file: File): SerializedFile {
    const serialized: SerializedFile = {
      name: file.name,
      content: file.content,
      type: file.type,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      history: file.history
    };

    if (file.children) {
      serialized.children = {};
      Object.entries(file.children).forEach(([name, child]) => {
        serialized.children[name] = this.serializeFileForStorage(child);
      });
    }

    return serialized;
  }

  private deserializeFileFromStorage(data: SerializedFile, parent?: File): File {
    const file = new File({
      name: data.name,
      content: data.content,
      type: data.type,
      parent,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });

    file.history = data.history || [];

    // Initialize children if it's a directory
    if (file.type === 'directory') {
      file.children = {};
    }

    if (data.children) {
      Object.entries(data.children).forEach(([name, childData]) => {
        // Now file.children is guaranteed to be initialized if file.type is 'directory'
        // If file.type is 'file', data.children should not exist, but if it does,
        // this would be an issue. Assuming data.children only exists for directories.
        file.children![name] = this.deserializeFileFromStorage(childData, file);
      });
    }

    return file;
  }
}

const fileDB = new FileDatabase();

const initializeStore = async (): Promise<{ rootFile: File; expandedFolders: Set<File> }> => {
  const savedState = await fileDB.loadState();
  if (savedState) {
    return savedState;
  }
  return {
    rootFile: createInitialRoot(),
    expandedFolders: new Set<File>()
  };
};

export const useFileStore = create<FileState>()((set, get) => {
  // 初期化
  initializeStore().then(initialState => {
    set({ ...initialState, isLoaded: true });
  });

  const saveState = () => {
    const state = get();
    fileDB.saveState(state.rootFile, state.expandedFolders);
  };

  return {
    rootFile: createInitialRoot(),
    expandedFolders: new Set<File>(),
    isLoaded: false, // 追加

    addFile: (fileData, parentPath = '') => set((state) => {
      const parent = findFileByPath(state.rootFile, parentPath) || state.rootFile;
      
      if (parent.type !== 'directory') {
        throw new Error('Cannot add file to non-directory');
      }
      
      const generateUniqueName = (baseName: string, existingNames: string[]): string => {
        if (!existingNames.includes(baseName)) {
          return baseName;
        }
        
        const nameWithoutExt = baseName.includes('.') 
          ? baseName.substring(0, baseName.lastIndexOf('.'))
          : baseName;
        const ext = baseName.includes('.') 
          ? baseName.substring(baseName.lastIndexOf('.'))
          : '';
        
        let counter = 1;
        let newName: string;
        do {
          newName = `${nameWithoutExt} (${counter})${ext}`;
          counter++;
        } while (existingNames.includes(newName));
        
        return newName;
      };
      
      const existingNames = parent.children ? Object.keys(parent.children) : [];
      const uniqueName = generateUniqueName(fileData.name, existingNames);
      
      const newFile = new File({
        ...fileData,
        name: uniqueName,
        parent: parent === state.rootFile ? undefined : parent
      });
      
      if (!parent.children) {
        parent.children = {};
      }
      parent.children[newFile.name] = newFile;
      
      const newState = { rootFile: state.rootFile };
      setTimeout(saveState, 0);
      return newState;
    }),
    
    updateFile: (file, updates) => set((state) => {
      const newState = { rootFile: updateFileInTree(state.rootFile, file, updates) };
      setTimeout(saveState, 0);
      return newState;
    }),
    
    deleteFile: (file) => set((state) => {
      const newState = { rootFile: deleteFileFromTree(state.rootFile, file) };
      setTimeout(saveState, 0);
      return newState;
    }),
    
    getFile: (path) => {
      const state = get();
      return findFileByPath(state.rootFile, path);
    },
    
    moveFile: (file, newParentPath) => set((state) => {
      const newParent = findFileByPath(state.rootFile, newParentPath) || state.rootFile;
      
      if (newParent.type !== 'directory') {
        return state;
      }
      
      deleteFileFromTree(state.rootFile, file);
      
      file.parent = newParent === state.rootFile ? undefined : newParent;
      
      if (!newParent.children) {
        newParent.children = {};
      }
      newParent.children[file.name] = file;
      
      const newState = { rootFile: state.rootFile };
      setTimeout(saveState, 0);
      return newState;
    }),
    
    toggleFolder: (folder) => set((state) => {
      const newExpanded = new Set(state.expandedFolders);
      if (newExpanded.has(folder)) {
        newExpanded.delete(folder);
      } else {
        newExpanded.add(folder);
      }
      const newState = { expandedFolders: newExpanded };
      setTimeout(saveState, 0);
      return newState;
    })
  };
});