import React, { useEffect, useState } from 'react';
import { DesktopLayout } from './components/Layout/DesktopLayout';
import { MobileLayout } from './components/Layout/MobileLayout';
import { TextEditor } from './components/Editor/TextEditor';
import { MarkdownPreview } from './components/Preview/MarkdownPreview';
import { FileTree } from './components/FileTree/FileTree';

function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
}

export default App;