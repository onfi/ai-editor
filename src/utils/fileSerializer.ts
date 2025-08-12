import { File } from '../types/index';

export interface SerializableFile {
  name: string;
  content: string;
  type: 'file' | 'directory';
  createdAt: string;
  updatedAt: string;
  children?: { [fileName: string]: SerializableFile };
  history: Array<{
    content: string;
    timestamp: string;
  }>;
}

export const serializeFile = (file: File): SerializableFile => {
  const serialized: SerializableFile = {
    name: file.name,
    content: file.content,
    type: file.type,
    createdAt: file.createdAt.toISOString(),
    updatedAt: file.updatedAt.toISOString(),
    history: file.history.map(h => ({
      content: h.content,
      timestamp: h.timestamp.toISOString()
    }))
  };

  if (file.children) {
    serialized.children = {};
    Object.entries(file.children).forEach(([name, child]) => {
      serialized.children![name] = serializeFile(child);
    });
  }

  return serialized;
};

export const deserializeFile = (data: SerializableFile, parent?: File): File => {
  const file = new File({
    name: data.name,
    content: data.content,
    type: data.type,
    parent,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt)
  });

  file.history = data.history.map(h => ({
    content: h.content,
    timestamp: new Date(h.timestamp)
  }));

  if (data.children) {
    file.children = {};
    Object.entries(data.children).forEach(([name, childData]) => {
      file.children![name] = deserializeFile(childData, file);
    });
  }

  return file;
};