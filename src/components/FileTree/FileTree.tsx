import React, { useState } from 'react';
import { Plus, FolderPlus, Settings } from 'lucide-react';
import { useFileStore } from '../../stores/fileStore';
import { TreeNode } from './TreeNode';
import { generateId } from '../../utils/helpers';
import type { File } from '../../types/index';
import { SettingsScreen } from '../Settings/SettingsScreen';

export const FileTree: React.FC = () => {
  const { files, addFile } = useFileStore();
  const [showSettings, setShowSettings] = useState(false);

  const handleCreateFile = () => {
    const newFile: File = {
      id: generateId(),
      name: 'untitled.md',
      content: '',
      parentId: null,
      type: 'file',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addFile(newFile);
  };

  const handleCreateDirectory = () => {
    const newDirectory: File = {
      id: generateId(),
      name: 'New Folder',
      content: '',
      parentId: null,
      type: 'directory',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addFile(newDirectory);
  };

  const rootFiles = files.filter(f => f.parentId === null);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b border-gray-700 bg-gray-800">
        <h2 className="text-sm font-semibold">Files</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCreateFile}
            className="p-1.5 rounded hover:bg-gray-700 transition-colors"
            title="新規ファイル"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={handleCreateDirectory}
            className="p-1.5 rounded hover:bg-gray-700 transition-colors"
            title="新規フォルダ"
          >
            <FolderPlus size={16} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 rounded hover:bg-gray-700 transition-colors"
            title="設定"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        {rootFiles.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-4">
            ファイルがありません
          </p>
        ) : (
          rootFiles.map(file => (
            <TreeNode key={file.id} file={file} level={0} />
          ))
        )}
      </div>
      
      {showSettings && (
        <SettingsScreen onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};