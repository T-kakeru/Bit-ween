# Prompt / 方針メモ

## 目的
- シンプルで可読性の高いSPAをReactで実装する。
- 画像のワイヤーフレームを参考にしつつ、初学者でも理解しやすい構成にする。

## 設計方針（要点）
- 画面構成は `Header + Sidebar + Main + Rightbar` の4分割。
- UIはタブ切り替えで操作しやすくする（新着/人気/ブックマーク）。
- スタイルはグローバルCSS（`src/styles/global.css`）に集約。
- コンポーネント分割は必要最小限、まず `App.jsx` で完結させる。
- ダミーデータで記事・部門・カテゴリを表示し、UIを先に固める。

## 参照元
- docs/wireframes/ に配置されたワイヤーフレーム
- ユーザー提供の画像（トップページ）

## 将来のリファクタ案
- `components/` に `Header`, `Sidebar`, `ArticleCard`, `Rightbar` を分割
- `pages/` に `Home` を作成し `App.jsx` から分離
- CSS Modules 化（必要になったタイミングで）
