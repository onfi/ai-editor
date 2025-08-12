import React from 'react';
import { FileText, Eye, FolderTree } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useThemeContext } from '../../contexts/ThemeContext';

interface MobileLayoutProps {
  editor: React.ReactNode;
  preview: React.ReactNode;
  fileTree: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  editor,
  preview,
  fileTree,
}) => {
  const { currentView, setCurrentView } = useSettingsStore();
  const { colors } = useThemeContext();

  const renderView = () => {
    switch (currentView) {
      case 'editor':
        return editor;
      case 'preview':
        return preview;
      case 'fileTree':
        return fileTree;
      default:
        return editor;
    }
  };

  return (
    <div className={`flex flex-col h-screen ${colors.bg} ${colors.text}`}>
      <div className="flex-1 overflow-hidden">
        {renderView()}
      </div>
      <div className={`flex border-t ${colors.border} ${colors.bgSecondary}`}>
        <button
          onClick={() => setCurrentView('fileTree')}
          className={`flex-1 p-4 flex flex-col items-center gap-1 transition-colors ${
            currentView === 'fileTree' ? 'text-blue-400' : colors.textMuted
          }`}
        >
          <FolderTree size={20} />
          <span className="text-xs">Files</span>
        </button>
        <button
          onClick={() => setCurrentView('editor')}
          className={`flex-1 p-4 flex flex-col items-center gap-1 transition-colors ${
            currentView === 'editor' ? 'text-blue-400' : colors.textMuted
          }`}
        >
          <FileText size={20} />
          <span className="text-xs">Editor</span>
        </button>
        <button
          onClick={() => setCurrentView('preview')}
          className={`flex-1 p-4 flex flex-col items-center gap-1 transition-colors ${
            currentView === 'preview' ? 'text-blue-400' : colors.textMuted
          }`}
        >
          <Eye size={20} />
          <span className="text-xs">Preview</span>
        </button>
      </div>
    </div>
  );
};