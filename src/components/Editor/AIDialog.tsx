import React, { useState } from 'react';
import { X } from 'lucide-react';
import { EditorView } from 'codemirror';
import { useEditorStore } from '../../stores/editorStore';
import { useSettingsStore } from '../../stores/settingsStore';

interface AIDialogProps {
  editorView: EditorView | null;
  onClose: () => void;
}

export const AIDialog: React.FC<AIDialogProps> = ({ editorView, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const { content, selectedText, cursorPosition } = useEditorStore();
  const { geminiApiKey } = useSettingsStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !editorView || !geminiApiKey) return;

    setLoading(true);
    try {
      // TODO: Gemini API呼び出しの実装
      console.log('AI機能は後で実装します');
    } catch (error) {
      console.error('AI生成エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">AIアシスト</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="AIへの指示を入力してください..."
            className="w-full h-32 p-3 bg-gray-900 border border-gray-700 rounded-lg resize-none focus:outline-none focus:border-blue-500"
            autoFocus
          />
          
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={loading || !prompt.trim() || !geminiApiKey}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {loading ? '生成中...' : '生成'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              キャンセル
            </button>
          </div>
          
          {!geminiApiKey && (
            <p className="mt-2 text-sm text-red-400">
              Gemini APIキーが設定されていません
            </p>
          )}
        </form>
      </div>
    </div>
  );
};