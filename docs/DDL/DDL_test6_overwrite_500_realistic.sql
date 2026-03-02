-- ==========================================
-- テスト6: 既存500件を削除して上書き投入（現実寄りデータ）
-- 前提: docs/DDL/DDL_main1.sql -> docs/DDL/DDL_main2.sql 実行済み
-- 現在日付: 2026-03-02
--
-- 要件（本ファイルで担保すること）
-- - 従業員 500 名を投入（employee_code: 2700001〜2700500）
-- - 既存の同レンジの500件は削除して上書きする
-- - 退職者の退職日は「2026/01 より前（= 2025-12-31 以前）」のみ
-- - 退職理由は「ITモチベ低下」を増やす（ただし極端な偏りは避ける）
-- ==========================================

BEGIN;

-- 0) 固定パラメータ
DROP TABLE IF EXISTS seed_params_test6;
DROP TABLE IF EXISTS seed_test6_prepared;

CREATE TEMP TABLE seed_params_test6 ON COMMIT DROP AS
SELECT
  '22222222-2222-2222-2222-222222222222'::uuid AS company_id,
  '株式会社テストカンパニー1'::text AS company_name,
  'test3-1@example.com'::text AS admin_email,
  'test3-2@example.com'::text AS viewer_email,
  'testpassword1'::text AS login_password,
  '2700001'::text AS admin_employee_code,
  '2700002'::text AS viewer_employee_code,
  500::int AS seed_count,
  140::int AS active_count,
  '2026-01-01'::date AS retire_date_cutoff;

-- 1) 会社（不足時のみ）
INSERT INTO companies (id, company_name)
SELECT p.company_id, p.company_name
FROM seed_params_test6 p
WHERE NOT EXISTS (
  SELECT 1
  FROM companies c
  WHERE c.id = p.company_id
);

-- 2) 必須マスタ（不足時のみ）
INSERT INTO work_statuses (name)
SELECT v.name
FROM (VALUES ('稼働'::text), ('待機'::text), ('休職'::text)) v(name)
WHERE NOT EXISTS (
  SELECT 1
  FROM work_statuses ws
  WHERE ws.name = v.name
);

INSERT INTO retirement_reasons (name)
SELECT v.name
FROM (
  VALUES
    ('キャリアアップ'::text),
    ('同業他社転職'::text),
    ('家庭問題'::text),
    ('ITモチベ低下'::text),
    ('給与不満'::text),
    ('会社不信'::text)
) v(name)
WHERE NOT EXISTS (
  SELECT 1
  FROM retirement_reasons rr
  WHERE rr.name = v.name
);

-- 3) 部署・クライアント（不足時のみ）
INSERT INTO departments (company_id, name)
SELECT p.company_id, v.name
FROM seed_params_test6 p
CROSS JOIN (
  VALUES
    ('開発'::text),
    ('インフラ'::text),
    ('サポート'::text),
    ('営業'::text),
    ('人事'::text),
    ('経理'::text),
    ('総務'::text),
    ('未所属'::text)
) v(name)
WHERE NOT EXISTS (
  SELECT 1
  FROM departments d
  WHERE d.company_id = p.company_id
    AND d.name = v.name
);

INSERT INTO clients (company_id, name)
SELECT p.company_id, v.name
FROM seed_params_test6 p
CROSS JOIN (
  VALUES
    ('クライアントA（製造）'::text),
    ('クライアントB（流通）'::text),
    ('クライアントC（金融）'::text),
    ('クライアントD（公共）'::text),
    ('クライアントE（医療）'::text),
    ('クライアントF（SaaS）'::text),
    ('クライアントG（通信）'::text),
    ('クライアントH（教育）'::text)
) v(name)
WHERE NOT EXISTS (
  SELECT 1
  FROM clients c
  WHERE c.company_id = p.company_id
    AND c.name = v.name
);

-- 4) 上書きのため、既存500件（2700001〜2700500）を削除
--    ※employees は company_id を持たないので departments 経由で絞ります。

-- 4-1) 該当従業員に紐づく users を先に削除（ログインユーザー含む）
DELETE FROM users u
USING employees e, departments d, seed_params_test6 p
WHERE u.employee_id = e.id
  AND d.id = e.department_id
  AND d.company_id = p.company_id
  AND e.employee_code ~ '^[0-9]+$'
  AND e.employee_code::int BETWEEN 2700001 AND 2700500;

DELETE FROM users u
USING seed_params_test6 p
WHERE u.company_id = p.company_id
  AND u.email IN (p.admin_email, p.viewer_email);

-- 4-2) 従業員を削除
DELETE FROM employees e
USING departments d, seed_params_test6 p
WHERE d.id = e.department_id
  AND d.company_id = p.company_id
  AND e.employee_code ~ '^[0-9]+$'
  AND e.employee_code::int BETWEEN 2700001 AND 2700500;

-- 5) 新しい500件を「現実寄り」の分布で生成（AIでルール設計）
--    - 在籍: 140名（retire_date=NULL）
--    - 退職: 360名（retire_date は 2025-12-31 以前）
--    - 退職理由: ITモチベ低下を約33%に増やす（極端にはしない）

CREATE TEMP TABLE seed_test6_prepared ON COMMIT DROP AS
WITH
seq AS (
  SELECT
    p.company_id,
    p.seed_count,
    p.active_count,
    p.retire_date_cutoff,
    generate_series(1, p.seed_count) AS n
  FROM seed_params_test6 p
),
name_src AS (
  SELECT
    s.*,
    (ARRAY['佐藤','鈴木','高橋','田中','伊藤','渡辺','山本','中村','小林','加藤','吉田','山田','佐々木','山口','松本','井上','木村','林','斎藤','清水','山崎','阿部','森','池田','橋本','石川','前田','藤田','後藤','岡田'])[floor(random() * 30 + 1)::int] AS last_name,
    (ARRAY['太郎','花','翔','結衣','蓮','悠斗','葵','優奈','颯太','大輝','さくら','優太','愛','陸','彩','陽向','美月','海斗','陽菜','航','心春','莉子','健太'])[floor(random() * 23 + 1)::int] AS first_name,
    random() AS r_active,
    random() AS r_gender,
    random() AS r_birth,
    random() AS r_dept,
    random() AS r_work,
    random() AS r_retire_year,
    random() AS r_retire_month,
    random() AS r_retire_jitter,
    random() AS r_tenure,
    random() AS r_reason,
    random() AS r_reason2,
    random() AS r_reason3,
    random() AS r_client
  FROM seq s
),
base AS (
  SELECT
    company_id,
    n,
    seed_count,
    active_count,
    retire_date_cutoff,
    (2700000 + n)::text AS employee_code,
    (last_name || first_name) AS full_name,
    CASE WHEN r_gender < 0.52 THEN '男性' ELSE '女性' END AS gender,
    (date '1970-01-01' + floor(r_birth * 12000)::int)::date AS birth_date,
    r_active,
    r_dept,
    r_work,
    r_retire_year,
    r_retire_month,
    r_retire_jitter,
    r_tenure,
    r_reason,
    r_reason2,
    r_reason3,
    r_client
  FROM name_src
),
active_flag AS (
  SELECT
    b.*,
    (row_number() OVER (ORDER BY b.r_active) <= b.active_count) AS is_active
  FROM base b
),
dept_and_work AS (
  SELECT
    a.*,
    CASE
      WHEN a.r_dept < 0.35 THEN '開発'
      WHEN a.r_dept < 0.57 THEN 'インフラ'
      WHEN a.r_dept < 0.75 THEN 'サポート'
      WHEN a.r_dept < 0.85 THEN '営業'
      WHEN a.r_dept < 0.91 THEN '人事'
      WHEN a.r_dept < 0.95 THEN '経理'
      WHEN a.r_dept < 0.98 THEN '総務'
      ELSE '未所属'
    END AS department_name,
    CASE
      WHEN a.is_active THEN
        CASE
          WHEN a.r_work < 0.74 THEN '稼働'
          WHEN a.r_work < 0.90 THEN '待機'
          ELSE '休職'
        END
      ELSE
        CASE
          WHEN a.r_work < 0.60 THEN '稼働'
          WHEN a.r_work < 0.90 THEN '待機'
          ELSE '休職'
        END
    END AS work_status_name
  FROM active_flag a
),
retire_date_calc AS (
  SELECT
    dw.*,
    CASE
      WHEN dw.is_active THEN NULL
      ELSE (CASE
        WHEN dw.r_retire_year < 0.10 THEN 2021
        WHEN dw.r_retire_year < 0.25 THEN 2022
        WHEN dw.r_retire_year < 0.45 THEN 2023
        WHEN dw.r_retire_year < 0.70 THEN 2024
        ELSE 2025
      END)
    END AS retire_year,
    CASE
      WHEN dw.is_active THEN NULL
      ELSE (CASE
        -- 季節性: 3月末（年度末）と9月末（半期末）に山、他月は薄く分散
        WHEN dw.r_retire_month < 0.28 THEN 3
        WHEN dw.r_retire_month < 0.46 THEN 9
        WHEN dw.r_retire_month < 0.52 THEN 4
        WHEN dw.r_retire_month < 0.58 THEN 10
        WHEN dw.r_retire_month < 0.64 THEN 1
        WHEN dw.r_retire_month < 0.70 THEN 2
        WHEN dw.r_retire_month < 0.76 THEN 5
        WHEN dw.r_retire_month < 0.81 THEN 6
        WHEN dw.r_retire_month < 0.86 THEN 7
        WHEN dw.r_retire_month < 0.91 THEN 8
        WHEN dw.r_retire_month < 0.95 THEN 11
        ELSE 12
      END)
    END AS retire_month
  FROM dept_and_work dw
),
retire_reason_calc AS (
  SELECT
    rdc.*,
    CASE
      WHEN rdc.is_active THEN NULL
      ELSE (
        -- 退職日は「月末付近」に寄せつつ、毎回ゆらぐ（0〜14日前倒し）
        (date_trunc('month', make_date(rdc.retire_year, rdc.retire_month, 1))
          + interval '1 month - 1 day')::date
        - floor(rdc.r_retire_jitter * 15)::int
      )
    END AS retire_date
  FROM retire_date_calc rdc
),
join_and_tenure AS (
  SELECT
    r.*,
    CASE
      WHEN r.is_active THEN
        (date '2018-04-01' + floor(random() * (date '2026-02-01' - date '2018-04-01'))::int)::date
      ELSE
        (r.retire_date
          - (CASE
              -- 在籍期間分布: 1〜3年が多め、3〜5年も一定、5年以上は少なめ
              WHEN r.r_tenure < 0.15 THEN (180 + floor(random() * 365))::int          -- 0.5〜1.5年
              WHEN r.r_tenure < 0.55 THEN (365 + floor(random() * 730))::int          -- 1〜3年
              WHEN r.r_tenure < 0.80 THEN (1095 + floor(random() * 730))::int         -- 3〜5年
              WHEN r.r_tenure < 0.95 THEN (1825 + floor(random() * 1095))::int        -- 5〜8年
              ELSE (2920 + floor(random() * 1460))::int                               -- 8〜12年
            END)
        )::date
    END AS join_date
  FROM retire_reason_calc r
),
attrs AS (
  SELECT
    j.*,
    date_part('year', age(COALESCE(j.retire_date, date '2026-03-02'), j.birth_date))::int AS age_years,
    CASE
      WHEN j.retire_date IS NULL THEN NULL
      -- date - date は「日数(int)」になるため、年数は日数を365.25で割る
      ELSE (j.retire_date - j.join_date)::numeric / 365.25
    END AS tenure_years
  FROM join_and_tenure j
),
reason_and_client AS (
  SELECT
    a.*,
    CASE
      WHEN a.is_active THEN NULL
      ELSE CASE
        -- 相関(1): 家庭問題 = 30代後半〜40代で「たまに」発生
        WHEN a.age_years BETWEEN 37 AND 49 AND a.r_reason3 < 0.18 THEN '家庭問題'

        -- 相関(2): 給与不満 = 在籍3年以上5年未満で発生しやすい
        WHEN a.tenure_years >= 3 AND a.tenure_years < 5 AND a.r_reason2 < 0.28 THEN '給与不満'

        -- 相関(3): ITモチベ低下 = 20代〜30代の開発にやや多い
        WHEN a.department_name = '開発' AND a.age_years BETWEEN 23 AND 39 AND a.r_reason < 0.38 THEN 'ITモチベ低下'

        -- 基本分布（ゆらぎあり）
        WHEN a.r_reason < 0.26 THEN 'ITモチベ低下'
        WHEN a.r_reason < 0.44 THEN '同業他社転職'
        WHEN a.r_reason < 0.60 THEN 'キャリアアップ'
        WHEN a.r_reason < 0.74 THEN '会社不信'
        WHEN a.r_reason < 0.88 THEN '給与不満'
        ELSE '家庭問題'
      END
    END AS retirement_reason_name,
    CASE
      WHEN a.work_status_name <> '稼働' THEN NULL
      WHEN a.r_client < (CASE WHEN a.is_active THEN 0.90 ELSE 0.70 END) THEN
        (ARRAY[
          'クライアントA（製造）','クライアントB（流通）','クライアントC（金融）','クライアントD（公共）',
          'クライアントE（医療）','クライアントF（SaaS）','クライアントG（通信）','クライアントH（教育）'
        ])[floor(random() * 8 + 1)::int]
      ELSE NULL
    END AS client_name
  FROM attrs a
)
SELECT
  employee_code,
  full_name,
  gender,
  birth_date,
  join_date,
  retire_date,
  retirement_reason_name,
  department_name,
  work_status_name,
  client_name
FROM reason_and_client;

-- 6) 従業員を投入
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
FROM seed_test6_prepared p
JOIN seed_params_test6 s ON TRUE
JOIN departments d
  ON d.company_id = s.company_id
 AND d.name = p.department_name
JOIN work_statuses ws
  ON ws.name = p.work_status_name
LEFT JOIN clients c
  ON c.company_id = s.company_id
 AND c.name = p.client_name
LEFT JOIN retirement_reasons rr
  ON rr.name = p.retirement_reason_name;

-- 7) 対象ユーザー（2名）を作成
WITH target_users AS (
  SELECT
    s.company_id,
    s.admin_employee_code AS employee_code,
    s.admin_email AS email,
    'admin'::text AS role,
    s.login_password AS login_password
  FROM seed_params_test6 s
  UNION ALL
  SELECT
    s.company_id,
    s.viewer_employee_code AS employee_code,
    s.viewer_email AS email,
    'general'::text AS role,
    s.login_password AS login_password
  FROM seed_params_test6 s
)
INSERT INTO users (company_id, employee_id, email, password, role)
SELECT
  tu.company_id,
  e.id,
  tu.email,
  tu.login_password,
  tu.role
FROM target_users tu
JOIN employees e
  ON e.employee_code = tu.employee_code
JOIN departments d
  ON d.id = e.department_id
 AND d.company_id = tu.company_id;

-- 8) 実行結果チェック（上書きなので「必ず500件」揃っていること）
SELECT
  p.company_id,
  p.company_name,
  p.seed_count AS expected_seed_count,
  (
    SELECT COUNT(*)
    FROM employees e
    JOIN departments d ON d.id = e.department_id
    WHERE d.company_id = p.company_id
      AND e.employee_code ~ '^[0-9]+$'
      AND e.employee_code::int BETWEEN 2700001 AND 2700500
  ) AS actual_seed_count,
  (
    SELECT COUNT(*)
    FROM employees e
    JOIN departments d ON d.id = e.department_id
    WHERE d.company_id = p.company_id
      AND e.retire_date IS NOT NULL
      AND e.retire_date < p.retire_date_cutoff
      AND e.employee_code ~ '^[0-9]+$'
      AND e.employee_code::int BETWEEN 2700001 AND 2700500
  ) AS retired_count,
  (
    SELECT COUNT(*)
    FROM employees e
    JOIN departments d ON d.id = e.department_id
    WHERE d.company_id = p.company_id
      AND e.retire_date IS NULL
      AND e.employee_code ~ '^[0-9]+$'
      AND e.employee_code::int BETWEEN 2700001 AND 2700500
  ) AS active_count,
  (
    SELECT MAX(e.retire_date)
    FROM employees e
    JOIN departments d ON d.id = e.department_id
    WHERE d.company_id = p.company_id
      AND e.employee_code ~ '^[0-9]+$'
      AND e.employee_code::int BETWEEN 2700001 AND 2700500
  ) AS max_retire_date
FROM seed_params_test6 p;

DO $$
DECLARE
  v_company_id uuid;
  v_expected int;
  v_actual int;
  v_bad_retire int;
BEGIN
  SELECT p.company_id, p.seed_count
  INTO v_company_id, v_expected
  FROM seed_params_test6 p
  LIMIT 1;

  SELECT COUNT(*)
  INTO v_actual
  FROM employees e
  JOIN departments d ON d.id = e.department_id
  WHERE d.company_id = v_company_id
    AND e.employee_code ~ '^[0-9]+$'
    AND e.employee_code::int BETWEEN 2700001 AND 2700500;

  IF v_actual <> v_expected THEN
    RAISE EXCEPTION 'DDL_test6 overwrite failed: expected % employees (codes 2700001-2700500) but got %.', v_expected, v_actual;
  END IF;

  SELECT COUNT(*)
  INTO v_bad_retire
  FROM employees e
  JOIN departments d ON d.id = e.department_id
  WHERE d.company_id = v_company_id
    AND e.retire_date IS NOT NULL
    AND e.retire_date >= date '2026-01-01'
    AND e.employee_code ~ '^[0-9]+$'
    AND e.employee_code::int BETWEEN 2700001 AND 2700500;

  IF v_bad_retire > 0 THEN
    RAISE EXCEPTION 'DDL_test6 validation failed: found % employees with retire_date >= 2026-01-01 (must be strictly before 2026-01-01).', v_bad_retire;
  END IF;
END $$;

-- 参考: 退職理由の分布（分析しやすさ確認用）
SELECT
  COALESCE(rr.name, e.retirement_reason_text, '(理由なし)') AS retirement_reason,
  COUNT(*) AS cnt
FROM employees e
JOIN departments d ON d.id = e.department_id
JOIN seed_params_test6 p ON p.company_id = d.company_id
LEFT JOIN retirement_reasons rr ON rr.id = e.retirement_reason_id
WHERE e.employee_code ~ '^[0-9]+$'
  AND e.employee_code::int BETWEEN 2700001 AND 2700500
  AND e.retire_date IS NOT NULL
GROUP BY COALESCE(rr.name, e.retirement_reason_text, '(理由なし)')
ORDER BY cnt DESC, retirement_reason;

COMMIT;
