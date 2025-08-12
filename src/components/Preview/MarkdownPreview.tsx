import React, { useMemo } from 'react';
import { configuredMarked as marked } from './marked';
import { useEditorStore } from '../../stores/editorStore';
import { useThemeContext } from '../../contexts/ThemeContext';

export const MarkdownPreview: React.FC = () => {
  const { content } = useEditorStore();
  const { colors, isDark } = useThemeContext();

  const htmlContent = useMemo(() => {
    return marked(content || '');
  }, [content]);

  const proseClasses = isDark 
    ? "prose prose-invert max-w-none prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-code:text-blue-300 prose-code:bg-gray-800/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-800/50 prose-pre:border prose-pre:border-gray-700/50"
    : "prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:text-blue-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200";

  return (
    <div className={`h-full overflow-auto p-6 ${colors.bg}`}>
      <div 
        className={proseClasses}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};