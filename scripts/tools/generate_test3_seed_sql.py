from __future__ import annotations

import argparse
import random
from calendar import monthrange
from dataclasses import dataclass
from datetime import date, timedelta
from pathlib import Path


def _sql_quote(value: str) -> str:
    return "'" + str(value).replace("'", "''") + "'"


def _weighted_choice(rng: random.Random, items: list[tuple[str, float]]) -> str:
    total = sum(w for _, w in items)
    if total <= 0:
        return items[0][0]
    r = rng.random() * total
    upto = 0.0
    for value, weight in items:
        upto += weight
        if r <= upto:
            return value
    return items[-1][0]


def _clamp_day(year: int, month: int, day: int) -> int:
    last_day = monthrange(year, month)[1]
    return max(1, min(day, last_day))


def _to_slash_date(value: date | None) -> str:
    if value is None:
        return ""
    return f"{value.year:04d}/{value.month:02d}/{value.day:02d}"


def _pick_day_for_join(rng: random.Random) -> int:
    bucket = rng.random()
    if bucket < 0.75:
        return 1
    if bucket < 0.86:
        return 16
    if bucket < 0.93:
        return 25
    return rng.randint(2, 28)


def _pick_day_for_retire(rng: random.Random, *, year: int, month: int) -> int:
    bucket = rng.random()
    if bucket < 0.72:
        return monthrange(year, month)[1]
    if bucket < 0.88:
        return 15
    return _clamp_day(year, month, rng.randint(1, 28))


def _pick_join_date(rng: random.Random, *, start_date: date, end_date: date) -> date:
    if end_date < start_date:
        return start_date

    years = list(range(start_date.year, end_date.year + 1))
    year_items: list[tuple[str, float]] = []
    for i, y in enumerate(years):
        # 6年企業: 直近ほど採用が多い（成長）
        year_items.append((str(y), (i + 1) ** 1.45))
    year = int(_weighted_choice(rng, year_items))

    # 中小IT企業っぽい採用ピーク（4月/10月）
    month_weights = {
        1: 0.45,
        2: 0.35,
        3: 0.9,
        4: 3.4,
        5: 1.2,
        6: 0.9,
        7: 0.55,
        8: 0.45,
        9: 0.85,
        10: 1.6,
        11: 0.95,
        12: 0.85,
    }

    min_month = start_date.month if year == start_date.year else 1
    max_month = end_date.month if year == end_date.year else 12
    month_items = [(str(m), month_weights[m]) for m in range(min_month, max_month + 1)]
    month = int(_weighted_choice(rng, month_items))

    picked = date(year, month, _clamp_day(year, month, _pick_day_for_join(rng)))
    if picked < start_date:
        return start_date
    if picked > end_date:
        return end_date
    return picked


def _pick_retire_date(rng: random.Random, *, min_date: date, max_date: date) -> date:
    if max_date < min_date:
        return min_date

    years = list(range(min_date.year, max_date.year + 1))
    year = int(_weighted_choice(rng, [(str(y), 1.0) for y in years]))

    # 退職ピーク: 年度末/賞与後
    month_weights = {
        1: 0.7,
        2: 0.6,
        3: 2.9,
        4: 0.6,
        5: 0.7,
        6: 1.5,
        7: 0.7,
        8: 0.7,
        9: 1.25,
        10: 0.85,
        11: 0.85,
        12: 1.8,
    }
    min_month = min_date.month if year == min_date.year else 1
    max_month = max_date.month if year == max_date.year else 12
    month = int(
        _weighted_choice(
            rng, [(str(m), month_weights[m]) for m in range(min_month, max_month + 1)]
        )
    )

    picked = date(
        year,
        month,
        _clamp_day(year, month, _pick_day_for_retire(rng, year=year, month=month)),
    )
    if picked < min_date:
        return min_date
    if picked > max_date:
        return max_date
    return picked


@dataclass(frozen=True)
class CsvEmployeeRow:
    full_name: str
    gender: str
    birth_date_text: str
    employee_code: str
    department_name: str
    join_date_text: str
    employment_status: str
    work_status_text: str
    client_name: str
    retire_date_text: str
    retirement_reason_name: str
    note: str


def generate_company_rows(
    *,
    total_count: int,
    active_count: int,
    start_employee_code: int,
    company_start: date,
    today: date,
    rng_seed: int,
) -> list[CsvEmployeeRow]:
    if total_count <= 0:
        return []
    if active_count < 0 or active_count > total_count:
        raise ValueError("active_count must be between 0 and total_count")

    rng = random.Random(rng_seed)

    surnames = [
        "佐藤",
        "鈴木",
        "高橋",
        "田中",
        "伊藤",
        "渡辺",
        "山本",
        "中村",
        "小林",
        "加藤",
        "吉田",
        "山田",
        "佐々木",
        "山口",
        "松本",
        "井上",
        "木村",
        "林",
        "斎藤",
        "清水",
        "山崎",
        "阿部",
        "森",
        "池田",
        "橋本",
        "石川",
        "前田",
        "藤田",
        "後藤",
        "岡田",
    ]
    given_male = [
        "太郎",
        "翔",
        "蓮",
        "悠斗",
        "颯太",
        "大輝",
        "優太",
        "陸",
        "陽向",
        "海斗",
        "航",
        "一樹",
        "智也",
        "拓海",
        "健太",
    ]
    given_female = [
        "花",
        "結衣",
        "美咲",
        "葵",
        "優奈",
        "さくら",
        "愛",
        "彩",
        "美月",
        "陽菜",
        "結菜",
        "凛",
        "心春",
        "杏奈",
        "莉子",
    ]

    # 中小企業: 部署は少なめ
    departments = [
        "営業",
        "開発",
        "インフラ",
        "サポート",
        "総務",
        "人事",
        "経理",
    ]
    department_items: list[tuple[str, float]] = []
    for d in departments:
        w = 1.0
        if d in {"開発", "インフラ", "サポート"}:
            w = 1.7
        if d in {"総務", "人事", "経理"}:
            w = 0.7
        department_items.append((d, w))

    clients = [
        "クライアントA（製造）",
        "クライアントB（流通）",
        "クライアントC（金融）",
        "クライアントD（公共）",
        "クライアントE（医療）",
        "クライアントF（SaaS）",
        "クライアントG（通信）",
        "クライアントH（教育）",
    ]

    retirement_reasons = [
        "キャリアアップ",
        "同業他社転職",
        "家庭問題",
        "ITモチベ低下",
        "給与不満",
        "会社不信",
    ]

    retired_count = total_count - active_count

    rows: list[CsvEmployeeRow] = []
    for index in range(total_count):
        employee_code = str(start_employee_code + index)

        is_female = rng.random() < 0.36
        gender = "女性" if is_female else "男性"

        surname = surnames[index % len(surnames)]
        given = (
            given_female[(index // 2) % len(given_female)]
            if is_female
            else given_male[(index // 2) % len(given_male)]
        )
        full_name = f"{surname}{given}"[:50]

        # 生年月日: 1975-01-01 〜 2005-12-31
        birth_base = date(1975, 1, 1)
        birth_span_days = int(31.0 * 365)
        birth_date = birth_base + timedelta(days=rng.randrange(birth_span_days))

        join_date = _pick_join_date(rng, start_date=company_start, end_date=today)
        department_name = _weighted_choice(rng, department_items)

        if index < retired_count:
            employment_status = "退職"
            min_retire = join_date + timedelta(days=90)
            retire_date = _pick_retire_date(rng, min_date=min_retire, max_date=today)
            retire_date_text = _to_slash_date(retire_date)
            retirement_reason_name = retirement_reasons[
                rng.randrange(len(retirement_reasons))
            ]
        else:
            employment_status = "在籍"
            retire_date_text = ""
            retirement_reason_name = ""

        # 稼働状態（在籍者中心に意味がある）
        work_bucket = rng.random()
        if work_bucket < 0.70:
            work_status_text = "稼働"
        elif work_bucket < 0.92:
            work_status_text = "待機"
        else:
            work_status_text = "休職"

        client_name = (
            clients[rng.randrange(len(clients))] if work_status_text == "稼働" else ""
        )

        rows.append(
            CsvEmployeeRow(
                full_name=full_name,
                gender=gender,
                birth_date_text=_to_slash_date(birth_date),
                employee_code=employee_code,
                department_name=department_name,
                join_date_text=_to_slash_date(join_date),
                employment_status=employment_status,
                work_status_text=work_status_text,
                client_name=client_name,
                retire_date_text=retire_date_text,
                retirement_reason_name=retirement_reason_name,
                note="",
            )
        )

    return rows


def build_seed_sql(
    *,
    company_id: str,
    company_name: str,
    admin_email: str,
    viewer_email: str,
    login_password: str,
    admin_employee_code: str,
    viewer_employee_code: str,
    src_rows: list[CsvEmployeeRow],
    output_name: str,
    generator_name: str,
) -> str:
    src_values_lines: list[str] = []
    for row in src_rows:
        src_values_lines.append(
            "  ("
            + ", ".join(
                [
                    _sql_quote(row.full_name),
                    _sql_quote(row.gender),
                    _sql_quote(row.birth_date_text),
                    _sql_quote(row.employee_code),
                    _sql_quote(row.department_name),
                    _sql_quote(row.join_date_text),
                    _sql_quote(row.employment_status),
                    _sql_quote(row.work_status_text),
                    _sql_quote(row.client_name),
                    _sql_quote(row.retire_date_text),
                    _sql_quote(row.retirement_reason_name),
                    _sql_quote(row.note),
                ]
            )
            + ")"
        )

    values_sql = ",\n".join(src_values_lines)

    return f"""-- ==========================================
-- 生成SQL: {output_name}
-- 生成元: {generator_name}
-- 前提: docs/DDL/DDL_main1.sql -> docs/DDL/DDL_main2.sql 実行済み
-- 目的: {company_name} へ社員データを投入する（テスト3）
-- 条件: 管理対象 {len(src_rows)} 名 / 現在在籍 {sum(1 for r in src_rows if r.employment_status == '在籍')} 名
-- ==========================================

-- ログイン情報メモ（このSQLで users に作成されます）
-- 管理者: {admin_email} / {login_password}
-- 一般  : {viewer_email} / {login_password}

BEGIN;

-- 0) 固定パラメータ
DROP TABLE IF EXISTS seed_params_test3_gen;
CREATE TEMP TABLE seed_params_test3_gen ON COMMIT DROP AS
SELECT
  {_sql_quote(company_id)}::uuid AS company_id,
  {_sql_quote(company_name)}::text AS company_name,
  {_sql_quote(admin_email)}::text AS admin_email,
  {_sql_quote(viewer_email)}::text AS viewer_email,
  {_sql_quote(login_password)}::text AS login_password,
  {_sql_quote(admin_employee_code)}::text AS admin_employee_code,
  {_sql_quote(viewer_employee_code)}::text AS viewer_employee_code;

-- 1) 会社を作成/更新
INSERT INTO companies (id, company_name)
SELECT p.company_id, p.company_name
FROM seed_params_test3_gen p
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

-- 2) 既存データ削除は行わない（冪等実行のため）
--    既に同じデータが存在する場合は、以降のINSERTでスキップします。

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
{values_sql}
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
),
ensure_work_statuses AS (
    INSERT INTO work_statuses (name)
    SELECT src.name
    FROM (
        VALUES
            ('稼働'::text),
            ('待機'::text),
            ('休職'::text)
    ) AS src(name)
    WHERE NOT EXISTS (
        SELECT 1
        FROM work_statuses ws
        WHERE ws.name = src.name
    )
    RETURNING id
),
ensure_retirement_reasons AS (
    INSERT INTO retirement_reasons (name)
    SELECT src.name
    FROM (
        VALUES
            ('キャリアアップ'::text),
            ('同業他社転職'::text),
            ('家庭問題'::text),
            ('ITモチベ低下'::text),
            ('給与不満'::text),
            ('会社不信'::text)
    ) AS src(name)
    WHERE NOT EXISTS (
        SELECT 1
        FROM retirement_reasons rr
        WHERE rr.name = src.name
    )
    RETURNING id
),
ensure_departments AS (
  INSERT INTO departments (company_id, name)
  SELECT
    p.company_id,
    src.department_name
  FROM seed_params_test3_gen p
  CROSS JOIN (SELECT DISTINCT department_name FROM prepared WHERE department_name IS NOT NULL) src
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
  FROM seed_params_test3_gen p
  CROSS JOIN (SELECT DISTINCT client_name FROM prepared WHERE client_name IS NOT NULL) src
  WHERE NOT EXISTS (
    SELECT 1
    FROM clients c
    WHERE c.company_id = p.company_id
      AND c.name = src.client_name
  )
  RETURNING id
),
ensure_side_effects AS (
    SELECT
        (SELECT COUNT(*) FROM ensure_work_statuses) AS work_statuses_inserted,
        (SELECT COUNT(*) FROM ensure_retirement_reasons) AS retirement_reasons_inserted,
        (SELECT COUNT(*) FROM ensure_departments) AS departments_inserted,
        (SELECT COUNT(*) FROM ensure_clients) AS clients_inserted
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
    pr.employee_code,
    pr.full_name,
    pr.gender,
    pr.birth_date,
    pr.join_date,
    pr.retire_date,
    rr.id,
    CASE
      WHEN rr.id IS NULL THEN pr.retirement_reason_name
      ELSE NULL
    END AS retirement_reason_text,
    d.id AS department_id,
    ws.id AS work_status_id,
    c.id AS client_id
  FROM prepared pr
  JOIN seed_params_test3_gen p ON TRUE
    CROSS JOIN ensure_side_effects _side_effects
  JOIN departments d
    ON d.company_id = p.company_id
   AND d.name = pr.department_name
  JOIN work_statuses ws
    ON ws.name = pr.work_status_name
  LEFT JOIN clients c
    ON c.company_id = p.company_id
   AND c.name = pr.client_name
  LEFT JOIN retirement_reasons rr
    ON rr.name = pr.retirement_reason_name
    WHERE NOT EXISTS (
        SELECT 1
        FROM employees e2
        JOIN departments d2 ON d2.id = e2.department_id
        WHERE d2.company_id = p.company_id
            AND e2.employee_code = pr.employee_code
    )
    ON CONFLICT DO NOTHING
  RETURNING id, employee_code
),
ensure_employees_applied AS (
    SELECT COUNT(*) AS inserted_count
    FROM inserted_employees
)
INSERT INTO users (company_id, employee_id, email, password, role)
SELECT
  p.company_id,
  e.id,
  u.email,
  p.login_password,
  u.role
FROM seed_params_test3_gen p
CROSS JOIN ensure_employees_applied _employees_applied
JOIN (
    SELECT 'admin'::text AS role, p.admin_employee_code AS employee_code, p.admin_email AS email
    FROM seed_params_test3_gen p
    UNION ALL
    SELECT 'general'::text AS role, p.viewer_employee_code AS employee_code, p.viewer_email AS email
    FROM seed_params_test3_gen p
) AS u
    ON TRUE
JOIN employees e
  ON e.employee_code = u.employee_code
JOIN departments d
  ON d.id = e.department_id
 AND d.company_id = p.company_id
WHERE NOT EXISTS (
    SELECT 1
    FROM users ux
    WHERE ux.company_id = p.company_id
        AND ux.email = u.email
)
ON CONFLICT DO NOTHING;

COMMIT;
"""


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "テスト3（中小企業: 管理対象500名・現在在籍130名・6年企業）のseed SQLを生成します。"
        )
    )
    parser.add_argument("--count", type=int, default=500)
    parser.add_argument("--active-count", type=int, default=130)
    parser.add_argument("--start-employee-code", type=int, default=36000001)
    parser.add_argument(
        "--company-id",
        type=str,
        default="33333333-3333-3333-3333-333333333333",
    )
    parser.add_argument("--company-name", type=str, default="株式会社テストカンパニー3")
    parser.add_argument("--admin-email", type=str, default="test3-1@example.com")
    parser.add_argument("--viewer-email", type=str, default="test3-2@example.com")
    parser.add_argument("--password", type=str, default="testpassword1")
    parser.add_argument(
        "--output",
        type=str,
        default="docs/DDL/DDL_test3_generated_500.sql",
    )
    parser.add_argument(
        "--rng-seed",
        type=int,
        default=303,
        help="生成結果の再現性用seed",
    )
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parents[2]

    today = date(2026, 3, 2)
    company_start = date(2020, 4, 1)  # 6年企業（2020/04〜）

    rows = generate_company_rows(
        total_count=args.count,
        active_count=args.active_count,
        start_employee_code=args.start_employee_code,
        company_start=company_start,
        today=today,
        rng_seed=args.rng_seed,
    )

    # ログイン用の2名は必ず先頭2行にする（employee_code固定で users と紐付けるため）
    admin_employee_code = str(args.start_employee_code)
    viewer_employee_code = str(args.start_employee_code + 1)
    if rows:
        rows[0] = CsvEmployeeRow(
            **{**rows[0].__dict__, "employee_code": admin_employee_code}
        )
    if len(rows) >= 2:
        rows[1] = CsvEmployeeRow(
            **{**rows[1].__dict__, "employee_code": viewer_employee_code}
        )

    sql = build_seed_sql(
        company_id=args.company_id,
        company_name=args.company_name,
        admin_email=args.admin_email,
        viewer_email=args.viewer_email,
        login_password=args.password,
        admin_employee_code=admin_employee_code,
        viewer_employee_code=viewer_employee_code,
        src_rows=rows,
        output_name=Path(args.output).name,
        generator_name="scripts/tools/generate_test3_seed_sql.py",
    )

    out_path = Path(args.output)
    resolved_out = out_path if out_path.is_absolute() else (repo_root / out_path)
    resolved_out.parent.mkdir(parents=True, exist_ok=True)
    resolved_out.write_text(sql, encoding="utf-8")
    print(
        f"Wrote SQL: {resolved_out} (employees={len(rows)}, active={args.active_count})"
    )


if __name__ == "__main__":
    main()
