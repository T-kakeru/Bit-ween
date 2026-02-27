-- ==========================================
-- 1. フェーズ１DB初期化（既存テーブルを削除してリセット）
-- ==========================================
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS retirement_reasons CASCADE;
DROP TABLE IF EXISTS work_statuses CASCADE;
DROP TABLE IF EXISTS companies CASCADE;



-- DDL1_テーブル作成.sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE work_statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE retirement_reasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    code VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code VARCHAR(100) NOT NULL,
    full_name VARCHAR(50) NOT NULL,
    gender VARCHAR(10),
    birth_date DATE,
    join_date DATE,
    retire_date DATE,
    retirement_reason_id UUID REFERENCES retirement_reasons(id),
    retirement_reason_text TEXT,
    department_id UUID NOT NULL REFERENCES departments(id),
    work_status_id UUID NOT NULL REFERENCES work_statuses(id),
    client_id UUID REFERENCES clients(id),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255),
    role VARCHAR(20) NOT NULL CHECK (role IN ('general', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMPTZ
);



-- DDL3_基本テストデータの挿入.sql
-- main1.sqlで作成したテーブルに対して、基本的なテストデータを挿入するSQLスクリプトです。
-- 1. 会社情報の登録
INSERT INTO companies (id, company_name) VALUES
('11111111-1111-1111-1111-111111111111', '株式会社テストカンパニー');

-- 2. 稼働状態マスタの登録
INSERT INTO work_statuses (id, name) VALUES
('a0000000-0000-0000-0000-000000000001', '稼働'),
('a0000000-0000-0000-0000-000000000002', '待機'),
('a0000000-0000-0000-0000-000000000003', '休職');

-- 3. 部署データの登録（経営・人事）
INSERT INTO departments (id, company_id, code, name) VALUES
('d1111111-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'MGMT', '経営'),
('d1111111-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'HR', '人事');

-- 4. 稼働先（クライアント）データの登録
INSERT INTO clients (id, company_id, name) VALUES
('c1111111-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'BEYO');

-- 5. 従業員データの登録
INSERT INTO employees (id, employee_code, full_name, gender, birth_date, join_date, retire_date, retirement_reason_id, department_id, work_status_id, client_id) VALUES
-- テストユーザー1 (稼働中、経営部、稼働先:BEYO)
('e1111111-0000-0000-0000-000000000003', '2600001', 'テストユーザー1', '男性', '1998-04-18', '2023-10-01', NULL, NULL, 'd1111111-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c1111111-0000-0000-0000-000000000001'),
-- テストユーザー2 (退職済み、人事部、稼働先:なし)
('e1111111-0000-0000-0000-000000000004', '2600002', 'テストユーザー2', '男性', NULL, '2023-11-01', '2023-11-10', NULL, 'd1111111-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', NULL);

-- 6. ユーザー（ログインアカウント）データの登録 (※ u を f に修正しました)
INSERT INTO users (id, company_id, employee_id, email, password, role) VALUES
-- テストユーザー1：管理者
('f1111111-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'e1111111-0000-0000-0000-000000000003', 'test1@example.com', 'testpassword1', 'admin'),
-- テストユーザー2：一般
('f1111111-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'e1111111-0000-0000-0000-000000000004', 'test2@example.com', 'testpassword1', 'general');

-- 7. 退職理由データの登録
INSERT INTO retirement_reasons (name) VALUES
('キャリアアップ'),
('同業他社転職'),
('家庭問題'),
('ITモチベ低下'),
('給与不満'),
('会社不信');