import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';
import { useFileStore } from '../../stores/fileStore';
import { useEditorStore } from '../../stores/editorStore';
import type { File as FileType } from '../../types/index';
import { ContextMenu } from './ContextMenu';
import { cn } from '../../utils/helpers';

interface TreeNodeProps {
  file: FileType;
  level: number;
}

export const TreeNode: React.FC<TreeNodeProps> = ({ file, level }) => {
  const { files, expandedFolders, toggleFolder } = useFileStore();
  const { currentFileId, setCurrentFileId, setContent } = useEditorStore();
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  const isExpanded = expandedFolders.has(file.id);
  const children = files.filter(f => f.parentId === file.id);
  const isActive = currentFileId === file.id;

  const handleClick = () => {
    if (file.type === 'directory') {
      toggleFolder(file.id);
    } else {
      setCurrentFileId(file.id);
      setContent(file.content);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const renderIcon = () => {
    if (file.type === 'directory') {
      if (isExpanded) {
        return <FolderOpen size={16} />;
      }
      return <Folder size={16} />;
    }
    return <File size={16} />;
  };

  return (
    <>
      <div
        className={cn(
          'flex items-center px-2 py-1 rounded cursor-pointer hover:bg-gray-800 transition-colors',
          isActive && 'bg-gray-800'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        {file.type === 'directory' && (
          <span className="mr-1">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}
        <span className="mr-2 text-gray-400">{renderIcon()}</span>
        <span className="text-sm truncate">{file.name}</span>
      </div>
      
      {file.type === 'directory' && isExpanded && (
        <div>
          {children.map(child => (
            <TreeNode key={child.id} file={child} level={level + 1} />
          ))}
        </div>
      )}
      
      {showContextMenu && (
        <ContextMenu
          file={file}
          position={contextMenuPosition}
          onClose={() => setShowContextMenu(false)}
        />
      )}
    </>
  );
};