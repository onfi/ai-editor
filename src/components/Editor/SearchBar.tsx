import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronUp, ChevronDown, Replace, RefreshCw } from 'lucide-react';
import { EditorView } from 'codemirror';
import { useThemeContext } from '../../contexts/ThemeContext';

interface SearchBarProps {
  editorView: EditorView | null;
  isOpen: boolean;
  onClose: () => void;
  isReplaceMode?: boolean;
}

interface SearchResult {
  from: number;
  to: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({ editorView, isOpen, onClose, isReplaceMode = false }) => {
  const [searchText, setSearchText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [isRegex, setIsRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(-1);
  const [matches, setMatches] = useState<SearchResult[]>([]);
  const [showReplace, setShowReplace] = useState(isReplaceMode);
  const { colors } = useThemeContext();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setShowReplace(isReplaceMode);
  }, [isReplaceMode]);

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
      // 無効な正規表現の場合は空の結果を返す
    }
    
    return results;
  };

  const performSearch = () => {
    if (!editorView || !searchText) return;
    
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

  useEffect(() => {
    if (searchText) {
      const timer = setTimeout(performSearch, 300);
      return () => clearTimeout(timer);
    } else {
      setMatches([]);
      setCurrentMatch(-1);
    }
  }, [searchText, isRegex, caseSensitive, editorView]);

  const replaceCurrentMatch = () => {
    if (!editorView || currentMatch === -1 || matches.length === 0) return;
    
    const match = matches[currentMatch];
    const text = editorView.state.doc.toString();
    const matchText = text.slice(match.from, match.to);
    
    let replacement = replaceText;
    
    if (isRegex) {
      try {
        const regex = new RegExp(searchText, caseSensitive ? '' : 'i');
        replacement = matchText.replace(regex, replaceText);
      } catch (e) {
        replacement = replaceText;
      }
    }
    
    editorView.dispatch({
      changes: {
        from: match.from,
        to: match.to,
        insert: replacement
      }
    });
    
    setTimeout(() => {
      performSearch();
      if (currentMatch < matches.length - 1) {
        goToNext();
      }
    }, 0);
  };

  const replaceAll = () => {
    if (!editorView || matches.length === 0) return;
    
    const text = editorView.state.doc.toString();
    let newText = text;
    let offset = 0;
    
    matches.forEach(match => {
      const adjustedFrom = match.from + offset;
      const adjustedTo = match.to + offset;
      const matchText = newText.slice(adjustedFrom, adjustedTo);
      
      let replacement = replaceText;
      
      if (isRegex) {
        try {
          const regex = new RegExp(searchText, caseSensitive ? '' : 'i');
          replacement = matchText.replace(regex, replaceText);
        } catch (e) {
          replacement = replaceText;
        }
      }
      
      newText = newText.slice(0, adjustedFrom) + replacement + newText.slice(adjustedTo);
      offset += replacement.length - (adjustedTo - adjustedFrom);
    });
    
    editorView.dispatch({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: newText
      }
    });
    
    setMatches([]);
    setCurrentMatch(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        if (showReplace) {
          if (e.shiftKey) {
            replaceAll();
          } else {
            replaceCurrentMatch();
          }
        }
      } else {
        if (e.shiftKey) {
          goToPrevious();
        } else {
          goToNext();
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`absolute top-2 right-2 z-10 ${colors.bg} rounded-lg shadow-lg border ${colors.border} p-2`}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReplace(!showReplace)}
            className={`p-1 rounded hover:${colors.bgTertiary}`}
            title={showReplace ? "検索のみに切り替え" : "置換に切り替え"}
          >
            {showReplace ? <Search size={16} /> : <Replace size={16} />}
          </button>
          
          <input
            ref={searchInputRef}
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="検索..."
            className={`w-48 px-2 py-1 text-sm rounded border ${colors.border} ${colors.bgSecondary} ${colors.text} focus:outline-none focus:ring-1 focus:ring-blue-500`}
          />
          
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevious}
              disabled={matches.length === 0}
              className={`p-1 rounded hover:${colors.bgTertiary} disabled:opacity-50 disabled:cursor-not-allowed`}
              title="前へ (Shift+Enter)"
            >
              <ChevronUp size={14} />
            </button>
            <button
              onClick={goToNext}
              disabled={matches.length === 0}
              className={`p-1 rounded hover:${colors.bgTertiary} disabled:opacity-50 disabled:cursor-not-allowed`}
              title="次へ (Enter)"
            >
              <ChevronDown size={14} />
            </button>
          </div>

          {searchText && (
            <span className={`text-xs ${colors.textMuted} whitespace-nowrap`}>
              {matches.length > 0 
                ? `${currentMatch + 1}/${matches.length}`
                : '0/0'
              }
            </span>
          )}

          <button
            onClick={onClose}
            className={`p-1 rounded hover:${colors.bgTertiary}`}
            title="閉じる (Esc)"
          >
            <X size={14} />
          </button>
        </div>

        {showReplace && (
          <div className="flex items-center gap-2">
            <div className="w-6" />
            <input
              ref={replaceInputRef}
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="置換..."
              className={`w-48 px-2 py-1 text-sm rounded border ${colors.border} ${colors.bgSecondary} ${colors.text} focus:outline-none focus:ring-1 focus:ring-blue-500`}
            />
            
            <button
              onClick={replaceCurrentMatch}
              disabled={currentMatch === -1 || matches.length === 0}
              className={`px-2 py-1 text-xs rounded ${colors.bgSecondary} hover:${colors.bgTertiary} disabled:opacity-50 disabled:cursor-not-allowed`}
              title="置換 (Ctrl+Enter)"
            >
              置換
            </button>
            
            <button
              onClick={replaceAll}
              disabled={matches.length === 0}
              className={`px-2 py-1 text-xs rounded ${colors.bgSecondary} hover:${colors.bgTertiary} disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1`}
              title="すべて置換 (Ctrl+Shift+Enter)"
            >
              <RefreshCw size={12} />
              すべて
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 ml-6">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="w-3 h-3"
            />
            <span className={`text-xs ${colors.text}`}>Aa</span>
          </label>
          
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={isRegex}
              onChange={(e) => setIsRegex(e.target.checked)}
              className="w-3 h-3"
            />
            <span className={`text-xs ${colors.text}`}>.*</span>
          </label>
        </div>
      </div>
    </div>
  );
};