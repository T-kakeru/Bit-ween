-- ==========================================
-- DDL_test7.sql
-- 前提: DDL_main1.sql -> DDL_main2.sql 実行済み
-- 目的:
--   1) ご提示の31名データを「Reach会社の全データ」として扱う（それ以外のReachデータは削除）
--   2) 部署は未選択（入力空）は '未所属' として登録
--   3) 稼働先（clients）はデータに出てくるもののみ追加（空/NULLは追加しない）
--   4) 指定3名（馬場/竹花/三部）を従業員と関連付けて users 作成（メール等はそのまま）
--
-- Reach : 管理対象 31 名（test7）
-- 管理者: y.baba@maisonmarc.com / testpassword1
-- 管理者: k.takehana@maisonmarc.com / testpassword1
-- 一般  : r.mitsube@maisonmarc.com / testpassword1
-- ==========================================

BEGIN;

-- 会社レコード（アプリ既定ID）
INSERT INTO companies (id, company_name)
VALUES ('11111111-1111-1111-1111-111111111111', 'Reach')
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

-- ==========================================
-- Reach会社の既存データをクリア（この31名データを全データにするため）
-- ==========================================

-- users は company_id で安全に全削除
DELETE FROM users
WHERE company_id = '11111111-1111-1111-1111-111111111111'::uuid;

-- employees は department -> company を辿って Reach 分のみ削除
DELETE FROM employees e
USING departments d
WHERE e.department_id = d.id
  AND d.company_id = '11111111-1111-1111-1111-111111111111'::uuid;

-- employees を消した後に、Reach の clients / departments を削除
DELETE FROM clients
WHERE company_id = '11111111-1111-1111-1111-111111111111'::uuid;

DELETE FROM departments
WHERE company_id = '11111111-1111-1111-1111-111111111111'::uuid;

-- ==========================================
-- test7 用社員データ（この31名を全データとして投入）
-- ==========================================

CREATE TEMP TABLE seed_test7_prepared ON COMMIT DROP AS
WITH src_raw (
  full_name,
  gender,
  birth_date_text,
  employee_code,
  department_name,
  join_date_text,
  employment_status,
  work_status_text,
  client_name,
  retire_date_text,
  retirement_reason_name,
  note
) AS (
  VALUES
('馬場雄大','男性','1998/04/18','2600001','','2023/10/01','在籍','稼働','BEYO','','',''),
('森雄樹','男性','1998/08/14','2600002','','2023/11/01','退職','稼働','BEYO','2023/11/10','ITモチベ低下',''),
('塚越蓮','男性','1996/04/03','2600003','','2023/11/01','在籍','稼働','miraie','','',''),
('西山紘平','男性','1996/03/14','2600004','','2023/11/01','在籍','稼働','MAIS','','',''),
('石橋亮典','男性','1997/05/09','2600005','','2023/12/01','在籍','稼働','レソナ','','',''),
('野口歩','男性','2002/04/04','2600006','','2023/12/05','退職','稼働','BEYO','2023/12/08','ITモチベ低下',''),
('伊東太輔','男性','1993/03/03','2600007','','2024/01/03','退職','稼働','miraie','2025/12/31','キャリア',''),
('矢川雄也','男性','1999/04/20','2600008','','2023/12/22','退職','稼働','BEYO','2024/02/21','ITモチベ低下',''),
('千葉愛加','女性','2000/05/10','2600009','','2024/01/04','退職','稼働','ソルク','2024/01/04','ITモチベ低下',''),
('大川礼','男性','1999/05/11','2600010','','2024/02/01','退職','稼働','intense','2025/05/01','ITモチベ低下',''),
('櫻沢志子','女性','1999/06/18','2600011','','2024/02/09','退職','稼働','リヴェル','2024/03/31','ITモチベ低下',''),
('新井田姫','女性','1997/07/03','2600012','','2024/04/01','退職','稼働','リヴェル','2024/04/10','ITモチベ低下',''),
('盛永真','男性','2001/10/29','2600013','','2024/04/01','退職','稼働','Reach','2025/05/01','家庭問題',''),
('岡田真次','男性','1998/01/28','2600014','','2024/03/25','在籍','稼働','百郷','','',''),
('井手彩奈','女性','2001/05/14','2600015','','2024/04/01','退職','稼働','miraie','2025/12/01','同業他社転職',''),
('三部涼太','男性','2003/07/13','2600016','','2024/04/15','在籍','稼働','engine','','',''),
('島崎悠太','男性','1995/09/28','2600017','','2024/04/12','退職','稼働','MAIS','2024/07/23','ITモチベ低下',''),
('伊藤真理子','女性','1999/04/07','2600018','','2024/06/26','退職','稼働','MindS','2025/08/29','ITモチベ低下',''),
('朝井萌子','女性','1995/01/18','2600019','','2024/09/01','退職','稼働','ソルク','2024/09/01','ITモチベ低下',''),
('紙石美空','女性','2002/10/08','2600020','','2024/09/01','退職','稼働','リヴェル','2024/10/22','家庭問題',''),
('宮野瑞奈','女性','2003/05/28','2600021','','2024/11/01','退職','稼働','miraie','2025/10/12','家庭問題',''),
('村田晶','男性','1998/12/28','2600022','','2024/10/11','在籍','稼働','miraie','','',''),
('梅村美里','女性','2005/03/29','2600023','','2024/12/01','退職','稼働','intense','2025/02/28','会社不信',''),
('保泉アリ','女性','2001/04/18','2600024','','2025/02/01','在籍','稼働','miraie','','',''),
('西尾美七','女性','1999/02/10','2600025','','2025/04/01','退職','稼働','intense','2025/04/10','会社不信',''),
('中島裕人','男性','1999/11/09','2600026','','2025/01/01','在籍','稼働','miraie','','',''),
('大貫海','男性','2004/06/24','2600027','','2025/05/08','退職','稼働','BEYO','2025/07/30','ITモチベ低下',''),
('中村海晟','男性','2004/06/12','2600028','','2025/05/19','退職','稼働','intense','2025/08/31','ITモチベ低下',''),
('西本成那','女性','1997/10/28','2600029','','2025/10/08','退職','稼働','MindS','2025/11/30','会社不信',''),
('伊藤裕亮','男性','1993/10/08','2600030','','2026/01/01','在籍','稼働','MAIS','','',''),
('竹花翔','男性','1997/09/18','2600031','','2025/12/18','在籍','稼働','','','','')
),
normalized AS (
  SELECT
    NULLIF(TRIM(full_name), '') AS full_name,
    NULLIF(TRIM(gender), '') AS gender,
    NULLIF(TRIM(birth_date_text), '') AS birth_date_text,
    NULLIF(TRIM(employee_code), '') AS employee_code,
    COALESCE(NULLIF(TRIM(department_name), ''), '未所属') AS department_name,
    NULLIF(TRIM(join_date_text), '') AS join_date_text,
    NULLIF(TRIM(employment_status), '') AS employment_status,
    NULLIF(TRIM(work_status_text), '') AS work_status_text,
    NULLIF(NULLIF(TRIM(client_name), ''), '-') AS client_name,
    NULLIF(TRIM(retire_date_text), '') AS retire_date_text,
    NULLIF(TRIM(retirement_reason_name), '') AS retirement_reason_name,
    NULLIF(TRIM(note), '') AS note
  FROM src_raw
  WHERE NULLIF(TRIM(employee_code), '') IS NOT NULL
),
prepared AS (
  SELECT
    full_name,
    gender,
    CASE WHEN birth_date_text IS NULL THEN NULL ELSE TO_DATE(birth_date_text, 'YYYY/MM/DD') END AS birth_date,
    employee_code,
    department_name,
    CASE WHEN join_date_text IS NULL THEN NULL ELSE TO_DATE(join_date_text, 'YYYY/MM/DD') END AS join_date,
    employment_status,
    CASE
      WHEN work_status_text IN ('休職', '休職中') THEN '休職'
      WHEN work_status_text IN ('待機', '待機中') THEN '待機'
      WHEN work_status_text IN ('稼働', '稼働中', '派遣', '開発', '陸特') THEN '稼働'
      ELSE '稼働'
    END AS work_status_name,
    client_name,
    CASE WHEN retire_date_text IS NULL THEN NULL ELSE TO_DATE(retire_date_text, 'YYYY/MM/DD') END AS retire_date,
    CASE
      WHEN retirement_reason_name = 'キャリア' THEN 'キャリアアップ'
      WHEN retirement_reason_name = '稼働問題' THEN 'ITモチベ低下'
      ELSE retirement_reason_name
    END AS retirement_reason_name,
    note
  FROM normalized
)
SELECT *
FROM prepared;

-- 必須マスタ（最小）
INSERT INTO work_statuses (name)
SELECT v.name
FROM (VALUES ('稼働'::text), ('待機'::text), ('休職'::text)) v(name)
WHERE NOT EXISTS (
  SELECT 1 FROM work_statuses ws WHERE ws.name = v.name
);

-- 退職理由は不足分のみ補完（NULLは除外）
INSERT INTO retirement_reasons (name)
SELECT DISTINCT p.retirement_reason_name
FROM seed_test7_prepared p
WHERE p.retirement_reason_name IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM retirement_reasons rr WHERE rr.name = p.retirement_reason_name
  );

-- 部署を追加
INSERT INTO departments (company_id, name)
SELECT DISTINCT
  '11111111-1111-1111-1111-111111111111'::uuid,
  p.department_name
FROM seed_test7_prepared p
WHERE p.department_name IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM departments d
    WHERE d.company_id = '11111111-1111-1111-1111-111111111111'::uuid
      AND d.name = p.department_name
  );

-- クライアントを追加
INSERT INTO clients (company_id, name)
SELECT DISTINCT
  '11111111-1111-1111-1111-111111111111'::uuid,
  p.client_name
FROM seed_test7_prepared p
WHERE p.client_name IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM clients c
    WHERE c.company_id = '11111111-1111-1111-1111-111111111111'::uuid
      AND c.name = p.client_name
  );

-- 社員を追加（同一会社内で employee_code 重複はスキップ）
INSERT INTO employees (
  employee_code,
  full_name,
  gender,
  birth_date,
  join_date,
  retire_date,
  retirement_reason_id,
  retirement_reason_text,
  department_id,
  work_status_id,
  client_id
)
SELECT
  p.employee_code,
  p.full_name,
  p.gender,
  p.birth_date,
  p.join_date,
  p.retire_date,
  rr.id,
  CASE WHEN rr.id IS NULL THEN p.retirement_reason_name ELSE NULL END AS retirement_reason_text,
  d.id AS department_id,
  ws.id AS work_status_id,
  c.id AS client_id
FROM seed_test7_prepared p
JOIN departments d
  ON d.company_id = '11111111-1111-1111-1111-111111111111'::uuid
 AND d.name = p.department_name
JOIN work_statuses ws
  ON ws.name = p.work_status_name
LEFT JOIN clients c
  ON c.company_id = '11111111-1111-1111-1111-111111111111'::uuid
 AND c.name = p.client_name
LEFT JOIN retirement_reasons rr
  ON rr.name = p.retirement_reason_name
WHERE NOT EXISTS (
  SELECT 1
  FROM employees e2
  JOIN departments d2 ON d2.id = e2.department_id
  WHERE d2.company_id = '11111111-1111-1111-1111-111111111111'::uuid
    AND e2.employee_code = p.employee_code
);

-- 対象ユーザーを再作成
WITH target_users AS (
  SELECT *
  FROM (
    VALUES
      ('2600001'::text, '馬場雄大'::text, 'y.baba@maisonmarc.com'::text, 'admin'::text),
      ('2600016'::text, '三部涼太'::text, 'r.mitsube@maisonmarc.com'::text, 'general'::text),
      ('2600031'::text, '竹花翔'::text, 'k.takehana@maisonmarc.com'::text, 'admin'::text)
  ) AS t(employee_code, full_name, email, role)
)
DELETE FROM users
WHERE company_id = '11111111-1111-1111-1111-111111111111'::uuid
  AND (
    email IN (SELECT tu.email FROM target_users tu)
    OR employee_id IN (
      SELECT e.id
      FROM employees e
      JOIN departments d ON d.id = e.department_id
      JOIN target_users tu ON tu.employee_code = e.employee_code
      WHERE d.company_id = '11111111-1111-1111-1111-111111111111'::uuid
    )
  );

WITH target_users AS (
  SELECT *
  FROM (
    VALUES
      ('2600001'::text, '馬場雄大'::text, 'y.baba@maisonmarc.com'::text, 'admin'::text),
      ('2600016'::text, '三部涼太'::text, 'r.mitsube@maisonmarc.com'::text, 'general'::text),
      ('2600031'::text, '竹花翔'::text, 'k.takehana@maisonmarc.com'::text, 'admin'::text)
  ) AS t(employee_code, full_name, email, role)
)
INSERT INTO users (company_id, employee_id, email, password, role)
SELECT
  '11111111-1111-1111-1111-111111111111'::uuid,
  e.id,
  tu.email,
  'testpassword1',
  tu.role
FROM target_users tu
JOIN employees e ON e.employee_code = tu.employee_code
JOIN departments d ON d.id = e.department_id
WHERE d.company_id = '11111111-1111-1111-1111-111111111111'::uuid
  AND NOT EXISTS (
    SELECT 1
    FROM users ux
    WHERE ux.company_id = '11111111-1111-1111-1111-111111111111'::uuid
      AND ux.email = tu.email
  );

-- ==========================================
-- 実行結果チェック（「test7が実行されていない」を即判定）
-- ==========================================

-- 1) Reach会社への投入状況サマリ
SELECT
  '11111111-1111-1111-1111-111111111111'::uuid AS company_id,
  (SELECT COUNT(*) FROM seed_test7_prepared) AS expected_min_employee_count,
  (
    SELECT COUNT(*)
    FROM employees e
    JOIN departments d ON d.id = e.department_id
    WHERE d.company_id = '11111111-1111-1111-1111-111111111111'
  ) AS actual_employee_count,
  (
    SELECT COUNT(*)
    FROM users u
    WHERE u.company_id = '11111111-1111-1111-1111-111111111111'
      AND u.email IN ('y.baba@maisonmarc.com', 'k.takehana@maisonmarc.com', 'r.mitsube@maisonmarc.com')
  ) AS target_user_count;

-- 2) 社員が不足していたら例外（部分成功を防ぐ）
DO $$
DECLARE
  v_company_id uuid := '11111111-1111-1111-1111-111111111111'::uuid;
  v_expected_min int;
  v_actual int;
  v_target_users int;
BEGIN
  SELECT COUNT(*) INTO v_expected_min FROM seed_test7_prepared;

  SELECT COUNT(*) INTO v_actual
  FROM employees e
  JOIN departments d ON d.id = e.department_id
  WHERE d.company_id = v_company_id;

  SELECT COUNT(*) INTO v_target_users
  FROM users u
  WHERE u.company_id = v_company_id
    AND u.email IN ('y.baba@maisonmarc.com', 'k.takehana@maisonmarc.com', 'r.mitsube@maisonmarc.com');

  IF v_actual < v_expected_min THEN
    RAISE EXCEPTION 'DDL_test7 seed is incomplete: expected at least % employees in Reach(1111...) but got %. Likely causes: SQL was partially executed/truncated, or rows were skipped by constraints/conflicts.',
      v_expected_min, v_actual;
  END IF;

  IF v_target_users < 3 THEN
    RAISE EXCEPTION 'DDL_test7 users are incomplete: expected 3 target users (y.baba / k.takehana / r.mitsube) but got %.',
      v_target_users;
  END IF;
END $$;

COMMIT;

-- 確認用クエリ
-- SELECT COUNT(*) AS employee_count FROM employees;
-- SELECT full_name, employee_code FROM employees WHERE employee_code IN ('2600001','2600016','2600031');
-- SELECT email, role, employee_id FROM users WHERE email IN ('y.baba@maisonmarc.com','k.takehana@maisonmarc.com','r.mitsube@maisonmarc.com');
