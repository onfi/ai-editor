# 気がきくエディタ

「気がきくエディタ」は、AIアシスタント機能を統合した高機能なMarkdownエディタです。リアルタイムプレビュー、ファイル管理、テーマ切り替えなど、快適な執筆環境を提供します。

## 機能

*   **AIアシスタント**: Google Gemini APIと連携し、テキスト生成や編集をサポートします。
*   **リアルタイムMarkdownプレビュー**: 記述したMarkdownが即座にレンダリングされ、視覚的に確認できます。
*   **ファイル管理**: ファイルやフォルダの作成、削除、名前変更、コピー、階層構造での管理が可能です。
*   **テーマ切り替え**: ライト、ダーク、システム設定に応じたテーマを選択できます。
*   **検索・置換**: エディタ内のテキストを検索し、置換することができます。
*   **Undo/Redo**: 編集履歴を元に戻したり、やり直したりできます。
*   **レスポンシブデザイン**: デスクトップとモバイルの両方で最適化されたレイアウトを提供します。
*   **データ永続化**: IndexedDBを利用して、作成したファイルや設定がブラウザに保存されます。

## 技術スタック

*   **フロントエンド**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
*   **状態管理**: [Zustand](https://zustand-bear.github.io/zustand/)
*   **スタイリング**: [Tailwind CSS](https://tailwindcss.com/)
*   **エディタ**: [CodeMirror 6](https://codemirror.net/)
*   **Markdownパーサー**: [Marked.js](https://marked.js.org/), [highlight.js](https://highlightjs.org/), [KaTeX](https://katex.org/)
*   **AI連携**: [Google Gemini API](https://ai.google.dev/gemini-api)
*   **ルーティング**: [React Router DOM](https://reactrouter.com/en/main)
*   **データ永続化**: [IndexedDB](https://developer.mozilla.org/ja/docs/Web/API/IndexedDB_API) ([Dexie.js](https://dexie.org/))
*   **ビルドツール**: [Vite](https://vitejs.dev/)
*   **テスト**: [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/react/)

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/ai-editor.git
cd ai-editor
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

プロジェクトのルートディレクトリに `.env` ファイルを作成し、必要に応じて以下の環境変数を設定します。

```env
# Google AdSense (任意)
VITE_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxx
VITE_ADSENSE_SLOT_ID=xxxxxxxxxx
```

### 4. Google Gemini APIキーの設定

アプリケーションを起動後、設定画面 (`/settings` または左下の歯車アイコン) からGoogle Gemini APIキーを設定してください。AIアシスタント機能を利用するために必要です。

## 開発

### 開発サーバーの起動

```bash
npm run dev
```

### ビルド

本番環境向けにアプリケーションをビルドします。

```bash
npm run build
```

### テスト

ユニットテストを実行します。

```bash
npm run test
```

### デプロイ (Cloudflare Pages)

Cloudflare Pagesにデプロイするためのコマンドです。

```bash
npm run deploy
```

## 使用方法

### 基本的なエディタ操作

*   左側のファイルツリーからファイルを選択するか、新規作成ボタンで新しいファイルを作成します。
*   中央のエディタでMarkdownを記述します。
*   右側のプレビューエリアでリアルタイムにレンダリング結果を確認できます。

### AIアシスタントの利用

*   `Ctrl + I` (Windows/Linux) または `Cmd + I` (macOS) を押すと、AIアシスタントダイアログが開きます。
*   プロンプトを入力し、AIにテキストの生成や編集を指示できます。

### 検索と置換

*   `Ctrl + F` (Windows/Linux) または `Cmd + F` (macOS) で検索バーを開きます。
*   `Ctrl + H` (Windows/Linux) または `Cmd + H` (macOS) で置換モード付きの検索バーを開きます。

### ファイル管理

*   ファイルツリー上部のアイコンで、新規ファイルや新規フォルダを作成できます。
*   ファイルやフォルダを右クリックすると、名前変更、コピー、削除などのコンテキストメニューが表示されます。

### テーマの変更

*   設定画面 (`/settings`) から、ライト、ダーク、システム設定のいずれかのテーマを選択できます。
