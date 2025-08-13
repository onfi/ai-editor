import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { EditorView } from 'codemirror';
import { useThemeContext } from '../../contexts/ThemeContext';

interface SearchBarProps {
  editorView: EditorView | null;
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  from: number;
  to: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({ editorView, isOpen, onClose }) => {
  const [searchText, setSearchText] = useState('');
  const [isRegex, setIsRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(-1);
  const [matches, setMatches] = useState<SearchResult[]>([]);
  const { colors } = useThemeContext();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        goToPrevious();
      } else {
        goToNext();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`absolute top-2 right-2 z-10 ${colors.bg} rounded-lg shadow-lg border ${colors.border} p-2`}>
      <div className="flex items-center gap-2">
        <Search size={16} className={colors.textMuted} />
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

      <div className="flex items-center gap-3 mt-2 pl-6">
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
  );
};