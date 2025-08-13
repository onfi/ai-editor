import React, { useState } from 'react';
import { Sparkles, Search, Undo, Redo } from 'lucide-react';
import { EditorView } from 'codemirror';
import { undo, redo, undoDepth, redoDepth } from '@codemirror/commands';
import { useThemeContext } from '../../contexts/ThemeContext';
import { AIDialog } from './AIDialog';
import { IconButton } from '../UI/IconButton';

interface ToolbarProps {
  editorView: EditorView | null;
  onSearchClick: () => void;
  onAIClick: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ editorView, onSearchClick, onAIClick }) => {
  const { colors } = useThemeContext();

  const handleUndo = () => {
    if (editorView) {
      undo(editorView);
    }
  };

  const handleRedo = () => {
    if (editorView) {
      redo(editorView);
    }
  };

  // Undo/Redoが利用可能かどうかをチェック
  const canUndo = editorView ? undoDepth(editorView.state) > 0 : false;
  const canRedo = editorView ? redoDepth(editorView.state) > 0 : false;

  return (
    <>
      <div className={`flex items-center gap-1 px-4 py-2 border-b ${colors.border} ${colors.bgSecondary} fixed top-0 w-full z-10 h-16`}>
        <IconButton
          icon={Sparkles}
          onClick={onAIClick}
          title="AIアシスト (Ctrl+I)"
        />
        <IconButton
          icon={Search}
          onClick={onSearchClick}
          title="検索 (Ctrl+F)"
        />
        <IconButton
          icon={Undo}
          onClick={handleUndo}
          title="元に戻す"
          disabled={!canUndo}
        />
        <IconButton
          icon={Redo}
          onClick={handleRedo}
          title="やり直す"
          disabled={!canRedo}
        />
      </div>
    </>
  );
};