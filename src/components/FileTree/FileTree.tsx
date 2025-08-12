import React from 'react';
import { Plus, FolderPlus, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFileStore } from '../../stores/fileStore';
import { useEditorStore } from '../../stores/editorStore';
import { useThemeContext } from '../../contexts/ThemeContext';
import { TreeNode } from './TreeNode';
import { IconButton } from '../UI/IconButton';

export const FileTree: React.FC = () => {
  const { rootFile, addFile } = useFileStore();
  const { colors } = useThemeContext();

  const handleCreateFile = () => {
    const { currentFile } = useEditorStore.getState();
    let parentPath = '';
    
    if (currentFile) {
      if (currentFile.type === 'directory') {
        parentPath = currentFile.getPath();
      } else if (currentFile.parent) {
        parentPath = currentFile.parent.getPath();
      }
    }
    
    const now = new Date();
    const newFile = {
      name: 'untitled.md',
      content: '',
      type: 'file' as const,
      createdAt: now,
      updatedAt: now,
      history: [],
    };
    addFile(newFile, parentPath);
  };

  const handleCreateDirectory = () => {
    const { currentFile } = useEditorStore.getState();
    let parentPath = '';
    
    if (currentFile) {
      if (currentFile.type === 'directory') {
        parentPath = currentFile.getPath();
      } else if (currentFile.parent) {
        parentPath = currentFile.parent.getPath();
      }
    }
    
    const now = new Date();
    const newDirectory = {
      name: 'New Folder',
      content: '',
      type: 'directory' as const,
      createdAt: now,
      updatedAt: now,
      history: [],
    };
    addFile(newDirectory, parentPath);
  };


  const rootFiles = rootFile.children ? Object.values(rootFile.children) : [];

  return (
    <div className="flex flex-col h-full">
      <div className={`flex items-center justify-end px-4 py-3 ${colors.border} ${colors.bgSecondary}`}>
        <div className="flex items-center gap-1">
          <IconButton
            icon={Plus}
            onClick={handleCreateFile}
            variant="tertiary"
            size="small"
            title="新規ファイル"
          />
          <IconButton
            icon={FolderPlus}
            onClick={handleCreateDirectory}
            variant="tertiary"
            size="small"
            title="新規フォルダ"
          />
          <Link to="/settings">
            <IconButton
              icon={Settings}
              variant="tertiary"
              size="small"
              title="設定"
            />
          </Link>
        </div>
      </div>
      
      <div className={`flex-1 overflow-auto ${colors.bg}`}>
        {rootFiles.length === 0 ? (
          <p className={`text-sm text-center mt-4 ${colors.textMuted}`}>
            ファイルがありません
          </p>
        ) : (
          rootFiles.map(file => (
            <TreeNode key={file.getPath()} file={file} level={0} />
          ))
        )}
      </div>
    </div>
  );
};