import React, { useState } from 'react';
import { Sparkles, Search, Undo, Redo } from 'lucide-react';
import { EditorView } from 'codemirror';
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
      editorView.dispatch({
        effects: EditorView.announce.of('Undo'),
      });
    }
  };

  const handleRedo = () => {
    if (editorView) {
      editorView.dispatch({
        effects: EditorView.announce.of('Redo'),
      });
    }
  };

  return (
    <>
      <div className={`flex items-center gap-1 px-4 py-2 border-b ${colors.border} ${colors.bgSecondary}`}>
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
        />
        <IconButton
          icon={Redo}
          onClick={handleRedo}
          title="やり直す"
        />
      </div>
    </>
  );
};