import Dexie, { Table } from 'dexie';
import { File, History } from '../../types';

export class AppDatabase extends Dexie {
  files!: Table<File>;
  histories!: Table<History>;

  constructor() {
    super('MarkdownEditorDB');
    this.version(1).stores({
      files: 'id, name, parentId, type, createdAt, updatedAt',
      histories: 'id, fileId, timestamp'
    });
  }
}

export const db = new AppDatabase();