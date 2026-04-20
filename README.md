# Open Essex Official Site

Cloudflare Pages でホストされる、Open Essex コミュニティ向けのメンバーポータルサイトです。

## 技術スタック
- **Frontend**: React + TypeScript + Vite
- **Styling**: Vanilla CSS
- **Authentication**: Firebase Auth (オプション)
- **Deployment**: Cloudflare Pages

## セットアップ

### 1. インストール
```bash
npm install
```

### 2. 環境変数の設定
`.env` ファイルを作成し、必要な環境変数を設定してください。
※Firebase Auth はオプションです。API キーが設定されていない場合、認証機能は自動的に無効化され、ポータルサイトの基本機能はそのまま利用可能です。

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### 3. 開発サーバーの起動
```bash
npm run dev
```

## プロジェクトの構成
- `/src`: React コンポーネントおよびメインロジック
- `/functions`: Cloudflare Pages Functions (API用)
- `/public`: 静的アセット

## デプロイ
本番環境へのデプロイは Cloudflare Pages に接続された Git リポジトリのメインブランチへのプッシュによって自動的に行われます。
```bash
npm run build
```
