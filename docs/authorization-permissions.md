# 権限管理の確認ファイル

このプロジェクトの権限設定は、以下を見れば全体を確認できます。

## 1. 権限の定義（正本）

- `src/features/auth/logic/authorization.js`

このファイルに以下があります。

- `AUTH_ROLES`
  - `admin`
  - `general`
- `PERMISSION_POLICY`
  - ロールごとの権限マトリクス
- `buildPermissionsByRole(rawRole)`
  - ロール文字列から実際の `permissions` を組み立てる関数

## 2. 画面での利用入口

- `src/features/auth/hooks/useAuthorization.js`

`useAuthorization()` が、ログインユーザーの role を読み、`authorization.js` の定義に基づいた `permissions` を返します。

## 3. 現在の権限マトリクス

| 権限キー | admin | general | 意味 |
|---|---:|---:|---|
| `employeeWrite` | true | false | 従業員の追加/編集/一括取込/保存 |
| `systemUsersWrite` | true | false | システムユーザーの登録/編集/削除/リセット |
| `masterDataWrite` | true | false | 部署・稼働先などマスタの追加/編集/削除 |
| `profileWrite` | true | false | プロフィール（氏名・部署など）の編集 |
| `profileCredentialsWrite` | true | true | 自分のメールアドレス変更/パスワードリセット |

## 4. 変更時のルール

1. 新しい権限を追加する場合は、まず `authorization.js` の `PERMISSION_POLICY` に追加
2. 画面側は `useAuthorization()` の `permissions` を参照して制御
3. `role === "admin"` の直書きで判定しない（表示ラベル変換などを除く）

## 5. 主要参照箇所（例）

- `src/pages/ManagerPage.jsx`（`employeeWrite`）
- `src/pages/SystemUsersPage.jsx`（`systemUsersWrite`）
- `src/pages/SettingsPage.jsx`（`profileWrite` / `profileCredentialsWrite` / `masterDataWrite`）
- `src/pages/ProfileEditPage.jsx`（`profileWrite`）
