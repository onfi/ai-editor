import React, { useState } from 'react';
import { Sparkles, Undo, Redo } from 'lucide-react';
import { EditorView } from 'codemirror';
import { useThemeContext } from '../../contexts/ThemeContext';
import { AIDialog } from './AIDialog';

interface ToolbarProps {
  editorView: EditorView | null;
}

export const Toolbar: React.FC<ToolbarProps> = ({ editorView }) => {
  const [showAIDialog, setShowAIDialog] = useState(false);
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
      <div className={`flex items-center gap-1 px-4 py-2 ${colors.border} ${colors.bgSecondary}`}>
        <button
          onClick={() => setShowAIDialog(true)}
          className={`p-1.5 rounded transition-colors ${colors.button}`}
          title="AIアシスト"
        >
          <Sparkles size={16} />
        </button>
        <button
          onClick={handleUndo}
          className={`p-1.5 rounded transition-colors ${colors.button}`}
          title="元に戻す"
        >
          <Undo size={16} />
        </button>
        <button
          onClick={handleRedo}
          className={`p-1.5 rounded transition-colors ${colors.button}`}
          title="やり直す"
        >
          <Redo size={16} />
        </button>
      </div>
      {showAIDialog && (
        <AIDialog
          editorView={editorView}
          onClose={() => setShowAIDialog(false)}
        />
      )}
    </>
  );
};