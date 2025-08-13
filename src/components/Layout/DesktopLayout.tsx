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
      <div className={`w-[10vw] min-w-[190px] border-r ${colors.border} overflow-hidden flex flex-col`}>
        {fileTree}
      </div>
      <div className="flex-1 flex">
        <div className={`w-[45vw] border-r ${colors.border} overflow-auto`}>
          {editor}
        </div>
        <div className={`p-8 flex-1 overflow-auto pt-0 mt-16`}>
          {preview}
        </div>
      </div>
    </div>
  );
};