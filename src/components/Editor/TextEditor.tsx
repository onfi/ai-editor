import React, { useEffect, useRef, useState } from 'react';
import { EditorView, minimalSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { lineNumbers } from '@codemirror/view';
import { history, historyKeymap } from '@codemirror/commands';
import { keymap } from '@codemirror/view';
import { useEditorStore } from '../../stores/editorStore';
import { useThemeContext } from '../../contexts/ThemeContext';
import { Toolbar } from './Toolbar';
import { SearchBar } from './SearchBar';
import { AIDialog } from './AIDialog';

export const TextEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const { content, setContent, setCursorPosition, setSelectedText } = useEditorStore();
  const { colors, isDark } = useThemeContext();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        setIsAIDialogOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;

    const extensions = [
      minimalSetup,
      lineNumbers(),
      markdown(),
      history(),
      keymap.of([...historyKeymap]),
      EditorView.lineWrapping, // テキストの折り返しを有効にする
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          setContent(update.state.doc.toString());
        }
        
        const selection = update.state.selection.main;
        setCursorPosition(selection.head);
        
        if (selection.from !== selection.to) {
          setSelectedText({ start: selection.from, end: selection.to });
        } else {
          setSelectedText(null);
        }
      }),
    ];
    
    if (isDark) {
      extensions.push(oneDark);
    }
    
    const startState = EditorState.create({
      doc: content,
      extensions,
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  useEffect(() => {
    if (viewRef.current && content !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: content,
        },
      });
    }
  }, [content]);

  return (
    <div className={`flex flex-col h-full p-0 ${colors.bg}`}>
      <Toolbar 
        editorView={viewRef.current} 
        onSearchClick={() => setIsSearchOpen(true)}
        onAIClick={() => setIsAIDialogOpen(true)}
      />
      <div className="relative flex-1">
        <SearchBar 
          editorView={viewRef.current} 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)} 
        />
        <div ref={editorRef} className={`h-full overflow-auto ${colors.bg}`} />
      </div>
      {isAIDialogOpen && (
        <AIDialog
          editorView={viewRef.current}
          onClose={() => setIsAIDialogOpen(false)}
        />
      )}
    </div>
  );
};