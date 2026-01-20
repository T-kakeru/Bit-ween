# mock データについて

このフォルダはフロントの表示確認用のテストデータです。
JSONは仕様上コメントを書けないため、ここに項目の説明を書きます。

## articles.json
- `id`: 記事ID
- `icon`: 表示用アイコン
- `title`: タイトル
- `tags`: タグ配列（UIでバッジ表示）
- `author`: 著者名
- `authorRoleId`: 権限ID（将来ログイン権限で利用）
- `date`: 投稿日
- `image`: 画像テーマ（CSSクラス名）
- `isPopular`: 人気タブ対象
- `isSaved`: 保存済みタブ対象
- `isRead`: 既読/未読表示
- `coverage`: 網羅率（%）
- `summary`: 記事の概要（詳細表示用）

## tabs.json
- タブ表示名の配列（例: 最新/人気/保存済み/未読）

## navItems.json
- サイドバーのメニュー項目

## departments.json / categories.json / tags.json
- 右/左カラムの一覧表示用データ
