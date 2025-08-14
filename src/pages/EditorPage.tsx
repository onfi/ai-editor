import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DesktopLayout } from '../components/Layout/DesktopLayout';
import { MobileLayout } from '../components/Layout/MobileLayout';
import { TextEditor } from '../components/Editor/TextEditor';
import { MarkdownPreview } from '../components/Preview/MarkdownPreview';
import { FileTree } from '../components/FileTree/FileTree';
import { useFileStore } from '../stores/fileStore';
import { useEditorStore } from '../stores/editorStore';
import { useSettingsStore } from '../stores/settingsStore';
import { File } from '../types/index';
import { v4 as uuidv4 } from 'uuid';

export const EditorPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { getFile, rootFile, addFile, isLoaded: filesLoaded } = useFileStore();
  const { setCurrentFile, setContent, currentFile } = useEditorStore();
  const { geminiApiKey, isLoaded: settingsLoaded } = useSettingsStore();
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!filesLoaded) return; // ファイルストアがロードされるまで待つ

    // URLのハッシュからファイルパスを取得
    const hash = location.hash;
    let fileFound = false;

    if (hash.length > 1) { // ハッシュが存在する場合
      const filePath = decodeURIComponent(hash.substring(1)); // '#'を除去
      // パスの先頭がrootの場合は除去（rootFile.getPath()がrootから始まるため）
      const cleanPath = filePath.startsWith('root/') ? filePath.substring(5) : filePath;
      const file = getFile(cleanPath);
      if (file && file.type === 'file') {
        setCurrentFile(file);
        setContent(file.content);
        fileFound = true;
      }
    }

    // ファイルが指定されていない、または存在しない場合
    if (!fileFound) {
      const rootFiles = rootFile.children ? Object.values(rootFile.children) : [];
      if (rootFiles.length > 0) {
        // 一番上のファイルを選択
        const firstFile = rootFiles[0];
        if (firstFile.type === 'file') {
          setCurrentFile(firstFile);
          setContent(firstFile.content);
        } else if (firstFile.type === 'directory' && firstFile.children && Object.values(firstFile.children).length > 0) {
          // 最初のディレクトリの最初のファイルを選択
          const firstFileInDir = Object.values(firstFile.children)[0];
          if (firstFileInDir.type === 'file') {
            setCurrentFile(firstFileInDir);
            setContent(firstFileInDir.content);
          }
        }
      } else {
        // ファイルが0個の場合、1件自動的に追加
        const newFile = new File({
          id: uuidv4(),
          name: '新しいテキスト.md',
          content: '',
          path: '',
          type: 'file',
          isNew: true,
        });
        addFile(newFile, ''); // ルートにファイルを追加
        setCurrentFile(newFile);
        setContent('');
      }
    }
  }, [location.hash, getFile, setCurrentFile, setContent, rootFile, addFile, filesLoaded]);

  useEffect(() => {
    if (currentFile) {
      document.title = `${currentFile.name} | 気がきくエディタ`;
    } else {
      document.title = '気がきくエディタ';
    }
  }, [currentFile]);

  useEffect(() => {
    if (settingsLoaded && !geminiApiKey) {
      navigate('/settings');
    }
  }, [geminiApiKey, navigate, settingsLoaded]);

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