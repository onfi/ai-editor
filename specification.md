# Markdownエディタ仕様書

## 技術スタック
- **フレームワーク**: React + TypeScript
- **ビルドツール**: Vite
- **状態管理**: Zustand
- **UIライブラリ**: Tailwind CSS
- **エディタ**: CodeMirror 6
- **Markdownパーサー**: marked
- **データストレージ**: IndexedDB (Dexie.js)
- **API連携**: Gemini API

## アーキテクチャ

### ディレクトリ構造
```
src/
├── components/
│   ├── Editor/
│   │   ├── TextEditor.tsx
│   │   ├── Toolbar.tsx
│   │   └── AIDialog.tsx
│   ├── Preview/
│   │   └── MarkdownPreview.tsx
│   ├── FileTree/
│   │   ├── FileTree.tsx
│   │   ├── TreeNode.tsx
│   │   └── ContextMenu.tsx
│   ├── Settings/
│   │   └── SettingsScreen.tsx
│   └── Layout/
│       ├── DesktopLayout.tsx
│       └── MobileLayout.tsx
├── stores/
│   ├── editorStore.ts
│   ├── fileStore.ts
│   └── settingsStore.ts
├── services/
│   ├── storage/
│   │   ├── indexedDB.ts
│   │   └── compression.ts
│   ├── ai/
│   │   └── geminiService.ts
│   └── history/
│       └── historyManager.ts
├── types/
│   └── index.ts
├── utils/
│   └── helpers.ts
└── App.tsx
```

## データモデル

### File
```typescript
interface File {
  id: string;
  name: string;
  content: string;
  parentId: string | null;
  type: 'file' | 'directory';
  createdAt: Date;
  updatedAt: Date;
}
```

### History
```typescript
interface History {
  id: string;
  fileId: string;
  content: string; // 圧縮済み
  timestamp: Date;
}
```

### Settings
```typescript
interface Settings {
  geminiApiKey: string;
  autoSaveInterval: number; // デフォルト: 60000 (1分)
}
```

## 主要機能の実装仕様

### 1. AIアシスタント機能
- プロンプト入力ダイアログ
- コンテキスト抽出
  - カーソル位置の前後1000文字
  - 選択テキストがある場合は選択範囲を含む
- Gemini APIへのリクエスト
- レスポンスの挿入/置換

### 2. 自動保存機能
- 1分ごとにタイマー実行
- 現在のコンテンツと最新履歴を比較
- 差分がある場合のみ保存
- Compression Streams APIで圧縮してIndexedDBに保存

### 3. ファイルツリー機能
- ドラッグ&ドロップ対応
- コンテキストメニュー（右クリック/長押し）
- ファイル/ディレクトリの作成・削除・リネーム

### 4. レスポンシブ対応
- ブレークポイント: 768px
- デスクトップ: 3カラムグリッド
- モバイル: 単一ビュー + フッタナビゲーション

## セキュリティ考慮事項
- APIキーはローカルストレージに暗号化して保存
- XSS対策: Markdownレンダリング時のサニタイズ
- CSP設定

## パフォーマンス最適化
- 仮想スクロール（大量ファイル対応）
- デバウンス処理（自動保存、プレビュー更新）
- Web Workerでの圧縮処理