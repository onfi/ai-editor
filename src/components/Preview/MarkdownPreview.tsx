import React, { useMemo } from 'react';
import { marked } from 'marked';
import { useEditorStore } from '../../stores/editorStore';

export const MarkdownPreview: React.FC = () => {
  const { content } = useEditorStore();

  const htmlContent = useMemo(() => {
    return marked(content || '');
  }, [content]);

  return (
    <div className="h-full overflow-auto p-4 bg-gray-900">
      <div 
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};