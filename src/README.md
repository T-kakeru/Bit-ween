# src 構成（推奨）

- `main.jsx`: Reactの起動入口（`#root` に描画）
- `App.jsx`: アプリのルート（画面/レイアウトの起点）
- `pages/`: 画面単位（入口）。FeatureやTemplateへデータ/イベントを注入する
- `templates/`: 画面共通レイアウト（ヘッダー/サイドバーなど）
- `features/`: 機能単位（例: articles, home）。UI/Hook/logic/api を内包
- `shared/`: 横断的に再利用するUI/Hook/logic/api/data
- `styles/`: グローバルCSSや共通スタイル（例: `global.css`）

運用ルールのおすすめ:
- グローバルCSSは `styles/global.css` に寄せる
- コンポーネント固有のスタイルは `Component.module.css`（CSS Modules）で閉じ込める
