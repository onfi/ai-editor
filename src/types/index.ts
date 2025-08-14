import { v4 as uuidv4 } from 'uuid';

export class File {
  id: string;
  name: string;
  content: string;
  path: string;
  type: 'file' | 'directory';
  isNew?: boolean;
  createdAt: Date;
  updatedAt: Date;
  parent?: File;
  children?: { [fileName: string]: File };
  history: History[] = [];

  constructor(data: {
    id?: string;
    name: string;
    content: string;
    path?: string;
    type: 'file' | 'directory';
    isNew?: boolean;
    parent?: File;
    createdAt?: Date;
    updatedAt?: Date;
    history?: History[]; // Add this line
  }) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.content = data.content;
    this.path = data.path || '';
    this.isNew = data.isNew || false;
    this.type = data.type;
    this.parent = data.parent;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.history = data.history || []; // Add this line
    if (this.type === 'directory') {
      this.children = {};
    }
  }

  getPath(): string {
    if (!this.parent) return this.name;
    return `${this.parent.getPath()}/${this.name}`;
  }
}

export interface History {
  content: string; // 圧縮済み
  timestamp: Date;
}

export interface Settings {
  geminiApiKey: string;
  autoSaveInterval: number; // デフォルト: 60000 (1分)
}

export interface SerializedFile {
  name: string;
  content: string;
  type: 'file' | 'directory';
  createdAt: Date;
  updatedAt: Date;
  history: History[];
  children?: { [fileName: string]: SerializedFile };
}

export interface FileStateData {
  rootFile: SerializedFile;
  expandedPaths: string[];
}