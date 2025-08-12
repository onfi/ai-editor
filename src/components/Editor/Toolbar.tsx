import React, { useState } from 'react';
import { Sparkles, Undo, Redo } from 'lucide-react';
import { EditorView } from 'codemirror';
import { AIDialog } from './AIDialog';

interface ToolbarProps {
  editorView: EditorView | null;
}

export const Toolbar: React.FC<ToolbarProps> = ({ editorView }) => {
  const [showAIDialog, setShowAIDialog] = useState(false);

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
      <div className="flex items-center gap-2 p-2 border-b border-gray-700 bg-gray-800">
        <button
          onClick={() => setShowAIDialog(true)}
          className="p-2 rounded hover:bg-gray-700 transition-colors"
          title="AIアシスト"
        >
          <Sparkles size={20} />
        </button>
        <button
          onClick={handleUndo}
          className="p-2 rounded hover:bg-gray-700 transition-colors"
          title="元に戻す"
        >
          <Undo size={20} />
        </button>
        <button
          onClick={handleRedo}
          className="p-2 rounded hover:bg-gray-700 transition-colors"
          title="やり直す"
        >
          <Redo size={20} />
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