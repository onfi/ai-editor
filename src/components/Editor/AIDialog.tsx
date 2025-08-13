import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { EditorView } from 'codemirror';
import { useEditorStore } from '../../stores/editorStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { Modal } from '../UI/Modal';
import { getGeminiService, type AIRequest } from '../../services/geminiService';
import { useThemeContext } from '../../contexts/ThemeContext';

interface AIDialogProps {
  editorView: EditorView | null;
  onClose: () => void;
}

export const AIDialog: React.FC<AIDialogProps> = ({ editorView, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { content, selectedText, cursorPosition } = useEditorStore();
  const { geminiApiKey } = useSettingsStore();
  const { colors } = useThemeContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // モーダルが開いた時にtextareaにフォーカスを当てる
    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 100); // モーダルのアニメーションが完了してからフォーカス
    
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !editorView || !geminiApiKey) return;

    setLoading(true);
    setError('');

    let prevText : string | undefined = undefined;
    let _selectedText : string | undefined = undefined;
    let afterText : string | undefined = undefined;

    if(selectedText) {
      _selectedText = content.slice(selectedText.start, selectedText.end);
      prevText = content.slice(0, selectedText.start);
      afterText = content.slice(selectedText.end);
    } else {
      prevText = content.slice(0, cursorPosition);
      afterText = content.slice(cursorPosition);
    }
  
    try {
      const geminiService = getGeminiService(geminiApiKey);
      const request: AIRequest = {
        prompt,
        prevText,
        selectedText: _selectedText,
        afterText
      };

      const response = await geminiService.generateText(request);
      
      if (!response.success) {
        setError(response.error || '不明なエラーが発生しました');
      }
      const result = response.text;
      let insertPos = cursorPosition;
      let selectionStart: number;
      let selectionEnd: number;
      
      if (selectedText) {
        // 選択テキストを置換
        selectionStart = selectedText.start;
        selectionEnd = selectedText.start + result.length;
        
        editorView.dispatch({
          changes: {
            from: selectedText.start,
            to: selectedText.end,
            insert: result
          },
          selection: {
            anchor: selectionStart,
            head: selectionEnd
          }
        });
      } else {
        // カーソル位置に挿入
        const insertText = "\n" + result + "\n";
        selectionStart = insertPos + 1; // \n の後から選択開始
        selectionEnd = insertPos + 1 + result.length; // result の終わりまで選択
        
        editorView.dispatch({
          changes: {
            from: insertPos,
            insert: insertText
          },
          selection: {
            anchor: selectionStart,
            head: selectionEnd
          }
        });
      }
      
      onClose();
    } catch (error) {
      console.error('AI生成エラー:', error);
      setError('AI生成中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="AIアシスタント"
      icon={<Sparkles />}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* プロンプト入力 */}
        <div>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            placeholder="AIへの指示入力してください..."
            rows={4}
            className={`w-full rounded-md border ${colors.border} ${colors.bgSecondary} ${colors.text} px-4 py-3 shadow-sm resize-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-25`}
          />
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* APIキー警告 */}
        {!geminiApiKey && (
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Gemini APIキーが設定されていません。設定画面で設定してください。
            </p>
          </div>
        )}

        {/* ボタン群 */}
        <div className="flex gap-3 pt-6">
          <>
            <button
              type="submit"
              disabled={loading || !prompt.trim() || !geminiApiKey}
              className={`relative flex-1 inline-flex justify-center rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed overflow-hidden transition-colors ${
                loading
                  ? 'bg-[length:200%_100%] animate-progress-7s'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}}
            >
              <span className="relative z-10">
                {loading ? '生成中...' : '生成 (Ctrl+Enter)'}
              </span>
            </button>
          </>
        </div>
      </form>
    </Modal>
  );
};