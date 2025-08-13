import React, { useState, useEffect } from 'react';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';
import { EditorView } from 'codemirror';
import { Modal } from '../UI/Modal';
import { useThemeContext } from '../../contexts/ThemeContext';

interface SearchDialogProps {
  editorView: EditorView | null;
  onClose: () => void;
}

interface SearchResult {
  from: number;
  to: number;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({ editorView, onClose }) => {
  const [searchText, setSearchText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [isRegex, setIsRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(-1);
  const [matches, setMatches] = useState<SearchResult[]>([]);
  const [error, setError] = useState('');
  const { colors } = useThemeContext();

  const findMatches = (text: string, pattern: string, useRegex: boolean, caseSensitive: boolean): SearchResult[] => {
    const results: SearchResult[] = [];
    
    if (!pattern) return results;

    try {
      if (useRegex) {
        const flags = caseSensitive ? 'g' : 'gi';
        const regex = new RegExp(pattern, flags);
        let match;
        
        while ((match = regex.exec(text)) !== null) {
          results.push({
            from: match.index,
            to: match.index + match[0].length
          });
        }
      } else {
        const searchPattern = caseSensitive ? pattern : pattern.toLowerCase();
        const searchText = caseSensitive ? text : text.toLowerCase();
        let index = 0;
        
        while ((index = searchText.indexOf(searchPattern, index)) !== -1) {
          results.push({
            from: index,
            to: index + pattern.length
          });
          index += pattern.length;
        }
      }
    } catch (e) {
      setError(isRegex ? '無効な正規表現です' : '検索エラーが発生しました');
    }
    
    return results;
  };

  const performSearch = () => {
    if (!editorView || !searchText) return;
    
    setError('');
    const content = editorView.state.doc.toString();
    const results = findMatches(content, searchText, isRegex, caseSensitive);
    setMatches(results);
    
    if (results.length > 0) {
      setCurrentMatch(0);
      highlightMatch(results[0]);
    } else {
      setCurrentMatch(-1);
    }
  };

  const highlightMatch = (match: SearchResult) => {
    if (!editorView) return;
    
    editorView.dispatch({
      selection: {
        anchor: match.from,
        head: match.to
      },
      scrollIntoView: true
    });
  };

  const goToNext = () => {
    if (matches.length === 0) return;
    
    const nextIndex = (currentMatch + 1) % matches.length;
    setCurrentMatch(nextIndex);
    highlightMatch(matches[nextIndex]);
  };

  const goToPrevious = () => {
    if (matches.length === 0) return;
    
    const prevIndex = currentMatch === 0 ? matches.length - 1 : currentMatch - 1;
    setCurrentMatch(prevIndex);
    highlightMatch(matches[prevIndex]);
  };

  const replaceOne = () => {
    if (!editorView || currentMatch === -1 || !matches[currentMatch]) return;
    
    const match = matches[currentMatch];
    editorView.dispatch({
      changes: {
        from: match.from,
        to: match.to,
        insert: replaceText
      }
    });
    
    performSearch();
  };

  const replaceAll = () => {
    if (!editorView || matches.length === 0) return;
    
    const changes = matches.map(match => ({
      from: match.from,
      to: match.to,
      insert: replaceText
    })).reverse();
    
    editorView.dispatch({
      changes
    });
    
    performSearch();
  };

  useEffect(() => {
    if (searchText) {
      const timer = setTimeout(performSearch, 300);
      return () => clearTimeout(timer);
    } else {
      setMatches([]);
      setCurrentMatch(-1);
    }
  }, [searchText, isRegex, caseSensitive]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        goToPrevious();
      } else {
        goToNext();
      }
    } else if (e.key === 'F3') {
      e.preventDefault();
      if (e.shiftKey) {
        goToPrevious();
      } else {
        goToNext();
      }
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="検索と置換"
      icon={<Search />}
      maxWidth="lg"
    >
      <div className="space-y-4" onKeyDown={handleKeyDown}>
        {/* 検索入力 */}
        <div>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="検索..."
              className={`flex-1 rounded-md border ${colors.border} ${colors.bgSecondary} ${colors.text} px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-25`}
              autoFocus
            />
            <button
              onClick={goToPrevious}
              disabled={matches.length === 0}
              className={`p-2 rounded-md ${colors.bgTertiary} ${colors.text} hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              title="前へ (Shift+Enter)"
            >
              <ChevronUp size={16} />
            </button>
            <button
              onClick={goToNext}
              disabled={matches.length === 0}
              className={`p-2 rounded-md ${colors.bgTertiary} ${colors.text} hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              title="次へ (Enter)"
            >
              <ChevronDown size={16} />
            </button>
          </div>
          
          {/* 検索結果カウント */}
          {searchText && (
            <div className={`mt-1 text-sm ${colors.textMuted}`}>
              {matches.length > 0 
                ? `${currentMatch + 1} / ${matches.length} 件`
                : '見つかりません'
              }
            </div>
          )}
        </div>

        {/* 置換入力 */}
        {showReplace && (
          <div className="flex gap-2">
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="置換..."
              className={`flex-1 rounded-md border ${colors.border} ${colors.bgSecondary} ${colors.text} px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-25`}
            />
            <button
              onClick={replaceOne}
              disabled={currentMatch === -1}
              className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              置換
            </button>
            <button
              onClick={replaceAll}
              disabled={matches.length === 0}
              className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              全て置換
            </button>
          </div>
        )}

        {/* オプション */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className={`text-sm ${colors.text}`}>大文字小文字を区別</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRegex}
              onChange={(e) => setIsRegex(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className={`text-sm ${colors.text}`}>正規表現</span>
          </label>
          
          <button
            onClick={() => setShowReplace(!showReplace)}
            className={`text-sm ${colors.link} hover:underline`}
          >
            {showReplace ? '置換を隠す' : '置換を表示'}
          </button>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* ショートカット説明 */}
        <div className={`text-xs ${colors.textMuted} space-y-1 pt-2 border-t ${colors.border}`}>
          <p>Enter: 次へ | Shift+Enter: 前へ | Esc: 閉じる</p>
        </div>
      </div>
    </Modal>
  );
};