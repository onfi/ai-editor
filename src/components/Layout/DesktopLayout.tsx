import React from 'react';
import { useThemeContext } from '../../contexts/ThemeContext';

interface DesktopLayoutProps {
  editor: React.ReactNode;
  preview: React.ReactNode;
  fileTree: React.ReactNode;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  editor,
  preview,
  fileTree,
}) => {
  const { colors } = useThemeContext();

  return (
    <div className={`flex h-screen ${colors.bg} ${colors.text}`}>
      <div className={`w-64 border-r ${colors.border} overflow-hidden flex flex-col`}>
        {fileTree}
      </div>
      <div className="flex-1 flex">
        <div className={`flex-1 border-r ${colors.border} overflow-hidden`}>
          {editor}
        </div>
        <div className="flex-1 overflow-hidden">
          {preview}
        </div>
      </div>
    </div>
  );
};