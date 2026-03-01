-- ==========================================
-- DDL_test3.sql
-- 前提: DDL_main1.sql -> DDL_main2.sql 実行済み
-- 目的: 中小SES想定（7年運用、退職累計500名規模）の分析用テストデータ投入
--
-- 使い方（超重要）
--  1) 下の "params" の値だけ編集
--  2) このSQLを実行
--  3) 別会社データが欲しいときは company_id/company_name 等を差し替える
--
-- メモ（設計方針）
--  - データは完全に自動生成（generate_series）
--  - 退職時期に波を作る（年によって退職が増減するように見せる）
--  - 退職理由は ITモチベ低下 を多めにする（＋年齢っぽい傾向を少し）
-- ==========================================

BEGIN;

WITH
params AS (
  SELECT
    -- 会社
    '33333333-3333-3333-3333-333333333333'::uuid AS company_id,
    'テストカンパニー3'::text AS company_name,

    -- ログインユーザー（2名）
    'test3-1@example.com'::text AS admin_email,
    'test3-2@example.com'::text AS viewer_email,
    'testpassword1'::text AS login_password,
    '3600001'::text AS admin_employee_code,
    '3600002'::text AS viewer_employee_code,

    -- 規模
    120::int AS active_count,
    500::int AS retired_count,

    -- 期間（7年=84ヶ月）
    DATE '2019-04-01' AS base_month,
    84::int AS months_total,

    -- クライアント数（稼働者のみ付与）
    12::int AS client_count,

    -- 退職の波（% と 月範囲）
    -- 例: 2021-2022（index 24-47）を多め、2019-2020（0-23）を少なめ、以降を中くらい
    45::int AS retire_peak_pct,  -- 0..44
    70::int AS retire_low_pct,   -- 45..69
    24::int AS retire_peak_start,
    24::int AS retire_peak_len,
    0::int AS retire_low_start,
    24::int AS retire_low_len,
    48::int AS retire_mid_start,
    36::int AS retire_mid_len,

    -- 勤続（月）
    6::int AS tenure_min_months,
    48::int AS tenure_span_months
),
upsert_company AS (
  INSERT INTO companies (id, company_name)
  SELECT p.company_id, p.company_name
  FROM params p
  ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name
  RETURNING id
),
del_users AS (
  DELETE FROM users u
  USING params p, upsert_company uc
  WHERE u.company_id = p.company_id
    AND u.email IN (p.admin_email, p.viewer_email)
  RETURNING u.id
),
del_employees AS (
  DELETE FROM employees e
  USING departments d, params p, upsert_company uc
  WHERE e.department_id = d.id
    AND d.company_id = p.company_id
  RETURNING e.id
),
del_departments AS (
  DELETE FROM departments d
  USING params p, upsert_company uc
  WHERE d.company_id = p.company_id
  RETURNING d.id
),
del_clients AS (
  DELETE FROM clients c
  USING params p, upsert_company uc
  WHERE c.company_id = p.company_id
  RETURNING c.id
),
src_raw (
  full_name,
  gender,
  birth_date,
  employee_code,
  department_name,
  join_date,
  work_status_name,
  client_name,
  retire_date,
  retirement_reason_name
) AS (
  -- ログインユーザー用（固定2名）
  SELECT
    'テスト管理者3', '男性', DATE '1990-04-01', p.admin_employee_code,
    '管理部', DATE '2022-04-01', '稼働', NULL::text, NULL::date, NULL::text
  FROM params p

  UNION ALL
  SELECT
    'テスト閲覧者3', '女性', DATE '1992-10-10', p.viewer_employee_code,
    '管理部', DATE '2023-04-01', '稼働', NULL::text, NULL::date, NULL::text
  FROM params p

  UNION ALL

  -- 在籍者（employee_code: 3600003..）
  SELECT
    '在籍社員' || LPAD(gs::text, 5, '0') AS full_name,
    CASE WHEN gs % 2 = 0 THEN '男性' ELSE '女性' END AS gender,
    (DATE '1988-01-01' + (gs * 29) * INTERVAL '1 day')::date AS birth_date,
    '36' || LPAD(gs::text, 5, '0') AS employee_code,
    CASE
      WHEN gs % 20 = 0 THEN '営業部'
      WHEN gs % 20 = 1 THEN 'PMO'
      WHEN gs % 20 IN (2, 3) THEN 'インフラ部'
      WHEN gs % 20 IN (4, 5, 6, 7, 8, 9, 10, 11) THEN '第1システム部'
      WHEN gs % 20 IN (12, 13, 14, 15, 16, 17) THEN '第2システム部'
      ELSE '管理部'
    END AS department_name,
    (p.base_month + (gs % p.months_total) * INTERVAL '1 month')::date AS join_date,
    CASE
      WHEN gs % 20 = 0 THEN '休職'
      WHEN gs % 6 = 0 THEN '待機'
      ELSE '稼働'
    END AS work_status_name,
    CASE
      WHEN (CASE WHEN gs % 20 = 0 THEN '休職' WHEN gs % 6 = 0 THEN '待機' ELSE '稼働' END) <> '稼働' THEN NULL
      ELSE 'テストクライアント' || CHR(65 + ((gs % p.client_count)))
    END AS client_name,
    NULL::date AS retire_date,
    NULL::text AS retirement_reason_name
  FROM params p
  CROSS JOIN generate_series(3, 3 + p.active_count - 1) AS gs

  UNION ALL

  -- 退職者（employee_code: activeの続きから）
  SELECT
    t.full_name,
    t.gender,
    t.birth_date,
    t.employee_code,
    t.department_name,
    t.join_date,
    t.work_status_name,
    t.client_name,
    t.retire_date,
    CASE
      WHEN t.gs % 80 = 0 THEN '病気'

      WHEN EXTRACT(YEAR FROM age(t.retire_date, t.birth_date)) <= 26
        THEN CASE
          WHEN t.gs % 3 = 0 THEN 'キャリアアップ'
          WHEN t.gs % 3 = 1 THEN '同業他社転職'
          ELSE 'ITモチベ低下'
        END

      WHEN EXTRACT(YEAR FROM age(t.retire_date, t.birth_date)) >= 35
        THEN CASE
          WHEN t.gs % 4 = 0 THEN '家庭問題'
          WHEN t.gs % 4 = 1 THEN '給与不満'
          WHEN t.gs % 4 = 2 THEN '会社不信'
          ELSE 'ITモチベ低下'
        END

      ELSE CASE
        WHEN t.gs % 10 <= 6 THEN 'ITモチベ低下'
        WHEN t.gs % 10 = 7 THEN '同業他社転職'
        WHEN t.gs % 10 = 8 THEN 'キャリアアップ'
        ELSE '会社不信'
      END
    END AS retirement_reason_name
  FROM (
    SELECT
      gs,
      ('退職社員' || LPAD(gs::text, 5, '0')) AS full_name,
      CASE WHEN gs % 2 = 0 THEN '男性' ELSE '女性' END AS gender,
      (DATE '1978-01-01' + (gs * 17) * INTERVAL '1 day')::date AS birth_date,
      ('36' || LPAD(gs::text, 5, '0')) AS employee_code,
      CASE
        WHEN gs % 20 = 0 THEN '営業部'
        WHEN gs % 20 = 1 THEN 'PMO'
        WHEN gs % 20 IN (2, 3) THEN 'インフラ部'
        WHEN gs % 20 IN (4, 5, 6, 7, 8, 9, 10, 11) THEN '第1システム部'
        WHEN gs % 20 IN (12, 13, 14, 15, 16, 17) THEN '第2システム部'
        ELSE '管理部'
      END AS department_name,

      -- 退職月（波を作る）
      (p.base_month + (
        CASE
          WHEN (gs % 100) < p.retire_peak_pct THEN p.retire_peak_start + (gs % p.retire_peak_len)
          WHEN (gs % 100) < p.retire_low_pct THEN p.retire_low_start + (gs % p.retire_low_len)
          ELSE p.retire_mid_start + (gs % p.retire_mid_len)
        END
      ) * INTERVAL '1 month')::date AS retire_date,

      -- 勤続（月）
      (p.tenure_min_months + (gs % p.tenure_span_months)) AS tenure_months,

      -- join/retire 整合
      (p.base_month + GREATEST(
        0,
        (
          (CASE
            WHEN (gs % 100) < p.retire_peak_pct THEN p.retire_peak_start + (gs % p.retire_peak_len)
            WHEN (gs % 100) < p.retire_low_pct THEN p.retire_low_start + (gs % p.retire_low_len)
            ELSE p.retire_mid_start + (gs % p.retire_mid_len)
          END) - (p.tenure_min_months + (gs % p.tenure_span_months))
        )
      ) * INTERVAL '1 month')::date AS join_date,

      CASE
        WHEN gs % 40 = 0 THEN '休職'
        WHEN gs % 25 = 0 THEN '待機'
        ELSE '稼働'
      END AS work_status_name,

      CASE
        WHEN (CASE WHEN gs % 40 = 0 THEN '休職' WHEN gs % 25 = 0 THEN '待機' ELSE '稼働' END) <> '稼働' THEN NULL
        ELSE 'テストクライアント' || CHR(65 + ((gs % p.client_count)))
      END AS client_name
    FROM params p
    CROSS JOIN generate_series((3 + p.active_count), (3 + p.active_count + p.retired_count - 1)) AS gs
  ) AS t
),
ensure_departments AS (
  INSERT INTO departments (company_id, code, name)
  SELECT
    p.company_id,
    NULL,
    src.department_name
  FROM (SELECT DISTINCT department_name FROM src_raw WHERE department_name IS NOT NULL) src
  CROSS JOIN params p
  CROSS JOIN upsert_company uc
  WHERE NOT EXISTS (
    SELECT 1
    FROM departments d
    WHERE d.company_id = p.company_id
      AND d.name = src.department_name
  )
  RETURNING id
),
ensure_clients AS (
  INSERT INTO clients (company_id, name)
  SELECT
    p.company_id,
    src.client_name
  FROM (SELECT DISTINCT client_name FROM src_raw WHERE client_name IS NOT NULL) src
  CROSS JOIN params p
  CROSS JOIN upsert_company uc
  WHERE NOT EXISTS (
    SELECT 1
    FROM clients c
    WHERE c.company_id = p.company_id
      AND c.name = src.client_name
  )
  RETURNING id
),
inserted_employees AS (
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
    s.employee_code,
    s.full_name,
    s.gender,
    s.birth_date,
    s.join_date,
    s.retire_date,
    rr.id,
    CASE WHEN rr.id IS NULL THEN s.retirement_reason_name ELSE NULL END AS retirement_reason_text,
    d.id AS department_id,
    ws.id AS work_status_id,
    c.id AS client_id
  FROM src_raw s
  CROSS JOIN params p
  JOIN departments d
    ON d.company_id = p.company_id
   AND d.name = s.department_name
  JOIN work_statuses ws
    ON ws.name = s.work_status_name
  LEFT JOIN clients c
    ON c.company_id = p.company_id
   AND c.name = s.client_name
  LEFT JOIN retirement_reasons rr
    ON rr.name = s.retirement_reason_name
  RETURNING id, employee_code
)
INSERT INTO users (company_id, employee_id, email, password, role)
SELECT
  p.company_id,
  e.id,
  u.email,
  p.login_password,
  u.role
FROM params p
JOIN (
  VALUES
    ('admin',  (SELECT admin_employee_code  FROM params), (SELECT admin_email  FROM params)),
    ('general',(SELECT viewer_employee_code FROM params), (SELECT viewer_email FROM params))
) AS u(role, employee_code, email)
  ON true
JOIN employees e
  ON e.employee_code = u.employee_code
JOIN departments d
  ON d.id = e.department_id
 AND d.company_id = p.company_id;

COMMIT;

-- 確認用クエリ
-- SELECT company_name FROM companies WHERE id = '33333333-3333-3333-3333-333333333333';
-- SELECT COUNT(*) AS employee_count
--   FROM employees e
--   JOIN departments d ON d.id = e.department_id
--  WHERE d.company_id = '33333333-3333-3333-3333-333333333333';
-- SELECT email, role, employee_id FROM users WHERE company_id = '33333333-3333-3333-3333-333333333333';
