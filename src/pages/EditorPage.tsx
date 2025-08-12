import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DesktopLayout } from '../components/Layout/DesktopLayout';
import { MobileLayout } from '../components/Layout/MobileLayout';
import { TextEditor } from '../components/Editor/TextEditor';
import { MarkdownPreview } from '../components/Preview/MarkdownPreview';
import { FileTree } from '../components/FileTree/FileTree';
import { useFileStore } from '../stores/fileStore';
import { useEditorStore } from '../stores/editorStore';

export const EditorPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { getFile } = useFileStore();
  const { setCurrentFile, setContent, currentFile } = useEditorStore();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // URLのハッシュからファイルパスを取得
    const hash = location.hash;
    if (hash.startsWith('#file/')) {
      const filePath = decodeURIComponent(hash.substring(6)); // '#file/'を除去
      // パスの先頭がrootの場合は除去（rootFile.getPath()がrootから始まるため）
      const cleanPath = filePath.startsWith('root/') ? filePath.substring(5) : filePath;
      const file = getFile(cleanPath);
      if (file && file.type === 'file') {
        setCurrentFile(file);
        setContent(file.content);
      }
    }
  }, [location.hash, getFile, setCurrentFile, setContent]);

  useEffect(() => {
    if (currentFile) {
      document.title = `${currentFile.name} | AI Editor`;
    } else {
      document.title = 'AI Editor';
    }
  }, [currentFile]);

  const editor = <TextEditor />;
  const preview = <MarkdownPreview />;
  const fileTree = <FileTree />;

  if (isMobile) {
    return (
      <MobileLayout
        editor={editor}
        preview={preview}
        fileTree={fileTree}
      />
    );
  }

  return (
    <DesktopLayout
      editor={editor}
      preview={preview}
      fileTree={fileTree}
    />
  );
};