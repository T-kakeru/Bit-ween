# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

開発サーバー: npm run dev（package.json）
本番ビルド: npm run build
ローカル本番確認: npm run preview
ESLint: npm run lint

## Supabase 接続（必須）

このアプリは Supabase をデータソースとして利用します。

- `.env.local.example` をコピーして `.env.local` を作成
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` を設定

本番デプロイ（Vercel等）では、プロジェクトの環境変数にも同じ値を必ず設定してください。

- 必須: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- 互換（任意）: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> 注意: Vite はビルド時に環境変数を埋め込みます。環境変数を追加・変更したら **再デプロイ（再ビルド）** が必要です。

### Vercel デプロイ時のチェックリスト

1. Vercel Project Settings → Environment Variables で以下を設定
	- `VITE_SUPABASE_URL`
	- `VITE_SUPABASE_ANON_KEY`
2. Environment は少なくとも `Production` に適用（必要なら `Preview` / `Development` も）
3. Save 後に `Redeploy` を実行
4. ブラウザで `/login` を開き、`DB接続が未設定です` が消えることを確認

例:

```bash
copy .env.local.example .env.local
```

## 開発時の自動ログイン（任意）

開発環境（`npm run dev`）では、Supabase が設定されていて、かつログアウト直後でなければ、テストユーザーで自動ログインを試みます。

- 無効化したい場合: `.env.local` に `VITE_DEV_AUTO_LOGIN=0`
- ログイン情報を変えたい場合: `VITE_DEV_AUTO_LOGIN_EMAIL` / `VITE_DEV_AUTO_LOGIN_PASSWORD`

※このプロジェクトをテンプレートとして利用する場合
このプロジェクトのディレクトリにて
npm create vite@latest new_project -- --template react
cd new_project
npm install
npm run dev

# システムを使うにあたって
IEですとタイウィンドCSSが誤動作（画面が白くなるなど）する可能性あり