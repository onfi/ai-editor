import React, { useEffect, useRef } from 'react';
import { Edit, Copy, Trash } from 'lucide-react';
import type { File } from '../../types/index';
import { useFileStore } from '../../stores/fileStore';

interface ContextMenuProps {
  file: File;
  position: { x: number; y: number };
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ file, position, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { updateFile, deleteFile, addFile } = useFileStore();

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
    const copyFile = {
      name: `${file.name} (コピー)`,
      content: file.content,
      type: file.type,
    };
    
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
      className="fixed bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 z-50"
      style={{ left: position.x, top: position.y }}
    >
      <button
        onClick={handleRename}
        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 w-full text-left text-sm"
      >
        <Edit size={14} />
        名前変更
      </button>
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 w-full text-left text-sm"
      >
        <Copy size={14} />
        コピー
      </button>
      <button
        onClick={handleDelete}
        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 w-full text-left text-sm text-red-400"
      >
        <Trash size={14} />
        削除
      </button>
    </div>
  );
};