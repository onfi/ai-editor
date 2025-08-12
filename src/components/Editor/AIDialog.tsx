import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { EditorView } from 'codemirror';
import { useEditorStore } from '../../stores/editorStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { Modal } from '../UI/Modal';
import { getGeminiService, AIRequest } from '../../services/geminiService';
import { useThemeContext } from '../../contexts/ThemeContext';

interface AIDialogProps {
  editorView: EditorView | null;
  onClose: () => void;
}

export const AIDialog: React.FC<AIDialogProps> = ({ editorView, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [aiType, setAiType] = useState<AIRequest['type']>('generate');
  const { content, selectedText, cursorPosition } = useEditorStore();
  const { geminiApiKey } = useSettingsStore();
  const { colors } = useThemeContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !editorView || !geminiApiKey) return;

    setLoading(true);
    setError('');
    setResult('');
    
    try {
      const geminiService = getGeminiService(geminiApiKey);
      
      const request: AIRequest = {
        prompt,
        context: content,
        selectedText: selectedText ? content.slice(selectedText.start, selectedText.end) : undefined,
        type: aiType
      };

      const response = await geminiService.generateText(request);
      
      if (response.success) {
        setResult(response.text);
      } else {
        setError(response.error || '不明なエラーが発生しました');
      }
    } catch (error) {
      console.error('AI生成エラー:', error);
      setError('AI生成中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleInsertText = () => {
    if (!editorView || !result) return;
    
    const state = editorView.state;
    let insertPos = cursorPosition;
    
    if (selectedText) {
      // 選択テキストを置換
      editorView.dispatch({
        changes: {
          from: selectedText.start,
          to: selectedText.end,
          insert: result
        }
      });
    } else {
      // カーソル位置に挿入
      editorView.dispatch({
        changes: {
          from: insertPos,
          insert: result
        }
      });
    }
    
    onClose();
  };

  const aiTypeOptions = [
    { value: 'generate', label: 'テキスト生成' },
    { value: 'edit', label: '文章校正' },
    { value: 'summarize', label: '要約' },
    { value: 'translate', label: '翻訳' },
    { value: 'improve', label: '改善' }
  ] as const;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="AIアシスタント"
      icon={<Sparkles />}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* AI機能タイプ選択 */}
        <div>
          <label className={`block text-sm font-medium ${colors.text} mb-2`}>
            AI機能タイプ
          </label>
          <select
            value={aiType}
            onChange={(e) => setAiType(e.target.value as AIRequest['type'])}
            className={`w-full rounded-md border ${colors.border} ${colors.bgSecondary} ${colors.text} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-25`}
          >
            {aiTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* プロンプト入力 */}
        <div>
          <label className={`block text-sm font-medium ${colors.text} mb-2`}>
            指示内容
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="AIへの指示を詳しく入力してください..."
            rows={4}
            className={`w-full rounded-md border ${colors.border} ${colors.bgSecondary} ${colors.text} px-3 py-2 shadow-sm resize-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-25`}
            autoFocus
          />
        </div>

        {/* 選択テキスト表示 */}
        {selectedText && (
          <div>
            <label className={`block text-sm font-medium ${colors.text} mb-2`}>
              選択されたテキスト
            </label>
            <div className={`rounded-md border ${colors.border} ${colors.bgTertiary} px-3 py-2 text-sm max-h-32 overflow-y-auto`}>
              <pre className={`whitespace-pre-wrap ${colors.textSecondary}`}>
                {content.slice(selectedText.start, selectedText.end)}
              </pre>
            </div>
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* 結果表示 */}
        {result && (
          <div>
            <label className={`block text-sm font-medium ${colors.text} mb-2`}>
              生成結果
            </label>
            <div className={`rounded-md border ${colors.border} ${colors.bgTertiary} px-3 py-2 max-h-64 overflow-y-auto`}>
              <pre className={`whitespace-pre-wrap text-sm ${colors.text}`}>
                {result}
              </pre>
            </div>
          </div>
        )}

        {/* APIキー警告 */}
        {!geminiApiKey && (
          <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-3">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Gemini APIキーが設定されていません。設定画面で設定してください。
            </p>
          </div>
        )}

        {/* ボタン群 */}
        <div className="flex gap-3 pt-4">
          {result ? (
            <>
              <button
                type="button"
                onClick={handleInsertText}
                className="flex-1 inline-flex justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
              >
                テキストを挿入
              </button>
              <button
                type="button"
                onClick={() => setResult('')}
                className={`px-3 py-2 text-sm font-semibold rounded-md border ${colors.border} ${colors.bgSecondary} ${colors.text} hover:${colors.bgTertiary} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors`}
              >
                クリア
              </button>
            </>
          ) : (
            <>
              <button
                type="submit"
                disabled={loading || !prompt.trim() || !geminiApiKey}
                className="flex-1 inline-flex justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '生成中...' : '生成'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className={`px-3 py-2 text-sm font-semibold rounded-md border ${colors.border} ${colors.bgSecondary} ${colors.text} hover:${colors.bgTertiary} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors`}
              >
                キャンセル
              </button>
            </>
          )}
        </div>
      </form>
    </Modal>
  );
};