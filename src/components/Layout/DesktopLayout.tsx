import React from 'react';

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
  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <div className="w-64 border-r border-gray-700 overflow-hidden flex flex-col">
        {fileTree}
      </div>
      <div className="flex-1 flex">
        <div className="flex-1 border-r border-gray-700 overflow-hidden">
          {editor}
        </div>
        <div className="flex-1 overflow-hidden">
          {preview}
        </div>
      </div>
    </div>
  );
};