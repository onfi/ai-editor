export interface File {
  id: string;
  name: string;
  content: string;
  parentId: string | null;
  type: 'file' | 'directory';
  createdAt: Date;
  updatedAt: Date;
}

export interface History {
  id: string;
  fileId: string;
  content: string; // 圧縮済み
  timestamp: Date;
}

export interface Settings {
  geminiApiKey: string;
  autoSaveInterval: number; // デフォルト: 60000 (1分)
}