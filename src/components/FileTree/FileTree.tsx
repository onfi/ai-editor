import React from 'react';
import { Plus, FolderPlus, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFileStore } from '../../stores/fileStore';
import { useEditorStore } from '../../stores/editorStore';
import { useThemeContext } from '../../contexts/ThemeContext';
import { TreeNode } from './TreeNode';
import { IconButton } from '../UI/IconButton';
import { File } from '../../types/index';

export const FileTree: React.FC = () => {
  const { rootFile, addFile } = useFileStore();
  const { colors } = useThemeContext();
  const navigate = useNavigate();

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
    const newFile = new File({
      name: 'untitled.md',
      content: '',
      type: 'file',
      createdAt: now,
      updatedAt: now,
      history: [],
    });
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
    const newDirectory = new File({
      name: 'New Folder',
      content: '',
      type: 'directory',
      createdAt: now,
      updatedAt: now,
      history: [],
    });
    addFile(newDirectory, parentPath);
  };


  const rootFiles = rootFile.children ? Object.values(rootFile.children) : [];

  return (
    <div className="flex flex-col h-full">
      <div className={`flex items-center gap-1 px-4 py-2 h-16 border-b ${colors.border} ${colors.bgSecondary}`}>
        <IconButton
          icon={Plus}
          onClick={handleCreateFile}
          title="新規ファイル"
        />
        <IconButton
          icon={FolderPlus}
          onClick={handleCreateDirectory}
          title="新規フォルダ"
        />
        <IconButton
          icon={Settings}
          onClick={() => navigate('/settings')}
          title="設定"
        />
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