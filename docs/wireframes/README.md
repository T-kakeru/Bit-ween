# Wireframes (Reference)

このフォルダは「実装参照用ワイヤーフレーム」を置く場所です。

## 置き方（おすすめ）
- `docs/wireframes/v1/` のように版管理フォルダを作り、その中にHTML/CSS/JS/画像をまとめて置いてください。

例:
- `docs/wireframes/v1/index.html`
- `docs/wireframes/v1/style.css`
- `docs/wireframes/v1/script.js`
- `docs/wireframes/v1/assets/`（画像など）

## 目的
- ここに置かれたファイルは、React実装時に画面/DOM構造/文言/レイアウトの参照元として扱います。

## 注意
- ここは参照用で、Viteのビルド対象（`src/`）にはしません。
- 実装は `src/` 配下にReactコンポーネントとして作ります。
