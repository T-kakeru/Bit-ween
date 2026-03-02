
-- 管理者: test1@example.com / testpassword1


-- 管理者: test1@example.com / testpassword1
-- 一般  : test2@example.com / testpassword1


-- DDL3_基本テストデータの挿入.sql
-- main1.sqlで作成したテーブルに対して、基本的なテストデータを挿入するSQLスクリプトです。
-- 1. 会社情報の登録
INSERT INTO companies (id, company_name) VALUES
('22222222-2222-2222-2222-222222222222', '株式会社テストカンパニー1');

-- 2. 稼働状態マスタの登録
INSERT INTO work_statuses (name) VALUES
('稼働'),
('待機'),
('休職');

-- 3. 部署データの登録（経営・人事）
INSERT INTO departments (id, company_id, name) VALUES
('d1111111-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', '経営'),
('d1111111-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', '人事');

-- 4. 稼働先（クライアント）データの登録
INSERT INTO clients (id, company_id, name) VALUES
('c1111111-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'BEYO');

-- 5. 従業員データの登録
INSERT INTO employees (
	id,
	employee_code,
	full_name,
	gender,
	birth_date,
	join_date,
	retire_date,
	retirement_reason_id,
	department_id,
	work_status_id,
	client_id
)
SELECT
	'e1111111-0000-0000-0000-000000000003'::uuid,
	'2600001',
	'テストユーザー1',
	'男性',
	'1998-04-18'::date,
	'2023-10-01'::date,
	NULL,
	NULL::uuid,
	'd1111111-0000-0000-0000-000000000003'::uuid,
	(
		SELECT ws.id
		FROM work_statuses ws
		WHERE ws.name = '稼働'
		ORDER BY ws.created_at ASC
		LIMIT 1
	),
	'c1111111-0000-0000-0000-000000000001'::uuid
UNION ALL
SELECT
	'e1111111-0000-0000-0000-000000000004'::uuid,
	'2600002',
	'テストユーザー2',
	'男性',
	NULL,
	'2023-11-01'::date,
	'2023-11-10'::date,
	NULL::uuid,
	'd1111111-0000-0000-0000-000000000004'::uuid,
	(
		SELECT ws.id
		FROM work_statuses ws
		WHERE ws.name = '休職'
		ORDER BY ws.created_at ASC
		LIMIT 1
	),
	NULL::uuid;

-- 6. ユーザー（ログインアカウント）データの登録 (※ u を f に修正しました)
INSERT INTO users (id, company_id, employee_id, email, password, role) VALUES
-- テストユーザー1：管理者
('f1111111-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'e1111111-0000-0000-0000-000000000003', 'test1@example.com', 'testpassword1', 'admin'),
-- テストユーザー2：一般
('f1111111-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'e1111111-0000-0000-0000-000000000004', 'test2@example.com', 'testpassword1', 'general');

-- 7. 退職理由データの登録
INSERT INTO retirement_reasons (name) VALUES
('キャリアアップ'),
('同業他社転職'),
('家庭問題'),
('ITモチベ低下'),
('給与不満'),
('会社不信');