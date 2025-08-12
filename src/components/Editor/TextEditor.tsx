import React, { useEffect, useRef } from 'react';
import { EditorView, minimalSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { useEditorStore } from '../../stores/editorStore';
import { Toolbar } from './Toolbar';

export const TextEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { content, setContent, setCursorPosition, setSelectedText } = useEditorStore();

  useEffect(() => {
    if (!editorRef.current) return;

    const startState = EditorState.create({
      doc: content,
      extensions: [
        minimalSetup,
        markdown(),
        oneDark,
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
      ],
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
    <div className="flex flex-col h-full">
      <Toolbar editorView={viewRef.current} />
      <div ref={editorRef} className="flex-1 overflow-auto" />
    </div>
  );
};