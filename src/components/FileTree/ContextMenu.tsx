import React, { useEffect, useRef } from 'react';
import { Edit, Copy, Trash } from 'lucide-react';
import { File } from '../../types/index';
import { useFileStore } from '../../stores/fileStore';
import { useThemeContext } from '../../contexts/ThemeContext';

interface ContextMenuProps {
  file: File;
  position: { x: number; y: number };
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ file, position, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { updateFile, deleteFile, addFile } = useFileStore();
  const { colors } = useThemeContext();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleRename = () => {
    const newName = prompt('新しい名前を入力してください:', file.name);
    if (newName && newName !== file.name) {
      updateFile(file, { name: newName });
    }
    onClose();
  };

  const handleCopy = () => {
    const now = new Date();
    const copyFile = new File({
      name: `${file.name} (コピー)`,
      content: file.content,
      type: file.type,
      createdAt: now,
      updatedAt: now,
      history: [],
    });
    
    const parentPath = file.parent ? file.parent.getPath() : '';
    addFile(copyFile, parentPath);
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`"${file.name}" を削除しますか？`)) {
      deleteFile(file);
    }
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className={`fixed ${colors.bg} ${colors.border} rounded-lg shadow-lg py-1 z-50`}
      style={{ left: position.x, top: position.y }}
    >
      <button
        onClick={handleRename}
        className={`flex items-center gap-2 px-3 py-2 ${colors.hover} w-full text-left text-sm`}
      >
        <Edit size={14} />
        名前変更
      </button>
      <button
        onClick={handleCopy}
        className={`flex items-center gap-2 px-3 py-2 ${colors.hover} w-full text-left text-sm`}
      >
        <Copy size={14} />
        コピー
      </button>
      <button
        onClick={handleDelete}
        className={`flex items-center gap-2 px-3 py-2 ${colors.hover} w-full text-left text-sm text-red-400`}
      >
        <Trash size={14} />
        削除
      </button>
    </div>
  );
};