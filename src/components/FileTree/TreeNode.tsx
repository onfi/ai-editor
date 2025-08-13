import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';
import { useFileStore } from '../../stores/fileStore';
import { useEditorStore } from '../../stores/editorStore';
import { useThemeContext } from '../../contexts/ThemeContext';
import type { File as FileType } from '../../types/index';
import { ContextMenu } from './ContextMenu';
import { cn } from '../../utils/helpers';

interface TreeNodeProps {
  file: FileType;
  level: number;
}

export const TreeNode: React.FC<TreeNodeProps> = ({ file, level }) => {
  const { expandedFolders, toggleFolder } = useFileStore();
  const { currentFile, setCurrentFile, setContent } = useEditorStore();
  const { colors } = useThemeContext();
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  const isExpanded = expandedFolders.has(file);
  const children = file.children ? Object.values(file.children) : [];
  const isActive = currentFile === file;

  const handleClick = () => {
    setCurrentFile(file);
    
    if (file.type === 'directory') {
      toggleFolder(file);
      setContent('');
    } else {
      setContent(file.content);
      // ファイル選択時にURLを更新（ハッシュベース）
      const filePath = file.getPath();
      const cleanPath = filePath.startsWith('root/') ? filePath.substring(5) : filePath;
      window.location.hash = `#${encodeURIComponent(cleanPath)}`;
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
        return <FolderOpen size={14} className={colors.folderIcon} />;
      }
      return <Folder size={14} className={colors.folderIcon} />;
    }
    return <File size={14} className={colors.fileIcon} />;
  };

  return (
    <>
      <div
        className={cn(
          `flex items-center py-1 cursor-pointer transition-colors group ${colors.hover}`,
          isActive && colors.active
        )}
        style={{ paddingLeft: `${level * 12 + 12}px`, paddingRight: '8px' }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        {file.type === 'directory' && (
          <span className={`mr-1 ${colors.textMuted} group-hover:${colors.textSecondary}`}>
            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
        )}
        <span className="mr-2">{renderIcon()}</span>
        <span className={cn(
          "text-sm truncate transition-colors",
          isActive ? `${colors.text} font-medium` : `${colors.textSecondary} group-hover:${colors.text}`
        )}>{file.name}</span>
      </div>
      
      {file.type === 'directory' && isExpanded && (
        <div>
          {children.map(child => (
            <TreeNode key={child.getPath()} file={child} level={level + 1} />
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