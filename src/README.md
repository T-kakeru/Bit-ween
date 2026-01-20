# src 構成（推奨）

- `main.jsx`: Reactの起動入口（`#root` に描画）
- `App.jsx`: アプリのルート（画面/レイアウトの起点）
- `pages/`: 画面単位（例: Home, Login）
- `components/`: 再利用コンポーネント（例: Button, Header）
- `layouts/`: 画面共通レイアウト（例: 2カラム、ヘッダー付き）
- `styles/`: グローバルCSSや共通スタイル（例: `global.css`）
- `hooks/`: カスタムHook（例: `useAuth`）
- `services/`: API通信など外部I/O
- `utils/`: 純粋関数・小物ユーティリティ
- `constants/`: 定数（文字列/数値/設定）

運用ルールのおすすめ:
- グローバルCSSは `styles/global.css` に寄せる
- コンポーネント固有のスタイルは `Component.module.css`（CSS Modules）で閉じ込める
