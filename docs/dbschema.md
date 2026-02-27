# Database Schema & Master Data Overview

このプロジェクトのデータベース構造、リレーションシップ、およびマスタデータの定義です。
AI（Copilot等）がモックデータ（JSON）の作成やTypeScriptの型定義、コンポーネントの実装を行う際は、必ずこの構造と具体的な値に準拠してください。

## 1. Master Data (固定マスタデータ)

モックデータの生成やUIの選択肢（Select）実装には、必ず以下の値を使用してください。

### 1-1. 稼働状態 (WorkStatus)
- 稼働中
- 休職中
- 待機

### 1-2. 退職理由 (RetirementReason)
- キャリアアップ
- 同業他社転職
- 家庭問題
- ITモチベ低下
- 給与不満
- 会社不信

### 1-3. システム権限 (User Role)
- general (一般)
- admin (管理者)

---

## 2. Entities & Relationships (テーブル構造とリレーション)

### Company (会社)
- `id`: UUID (Primary Key)
- `company_name`: string
- `created_at`: datetime

### Department (部署)
- `id`: UUID (Primary Key)
- `company_id`: UUID (Foreign Key -> Company.id)
- `code`: string (optional)
- `name`: string
- `created_at`: datetime

### Client (稼働先)
- `id`: UUID (Primary Key)
- `company_id`: UUID (Foreign Key -> Company.id)
- `name`: string
- `created_at`: datetime

### WorkStatus (稼働状態)
- `id`: UUID (Primary Key)
- `name`: string (上記「1-1. 稼働状態」の値を使用)

### RetirementReason (退職理由)
- `id`: UUID (Primary Key)
- `name`: string (上記「1-2. 退職理由」の値を使用)

### Employee (従業員)
- `id`: UUID (Primary Key)
- `company_id`: UUID (Foreign Key -> Company.id)
- `employee_code`: string (会社ごとにユニーク)
- `full_name`: string
- `gender`: string (optional)
- `birth_date`: date (YYYY-MM-DD, optional)
- `join_date`: date (YYYY-MM-DD, optional)
- `retire_date`: date (YYYY-MM-DD, optional)
- `retirement_reason_id`: UUID (Foreign Key -> RetirementReason.id, optional)
- `retirement_reason_text`: string (optional)
- `department_id`: UUID (Foreign Key -> Department.id)
- `work_status_id`: UUID (Foreign Key -> WorkStatus.id)
- `client_id`: UUID (Foreign Key -> Client.id, optional)

### User (システムユーザー)
- `id`: UUID (Primary Key)
- `company_id`: UUID (Foreign Key -> Company.id)
- `employee_id`: UUID (Foreign Key -> Employee.id, optional)
- `email`: string (会社ごとにユニーク)
- `role`: string (上記「1-3. システム権限」の値を使用)
- `created_at`: datetime