from __future__ import annotations

import argparse
import random
import csv
from dataclasses import dataclass
from calendar import monthrange
from datetime import date, timedelta
from pathlib import Path
from typing import Iterable


def _parse_slash_date(value: str) -> date | None:
    raw = str(value or "").strip()
    if not raw:
        return None
    normalized = raw.replace("-", "/")
    parts = normalized.split("/")
    if len(parts) != 3:
        return None
    try:
        year, month, day = (int(parts[0]), int(parts[1]), int(parts[2]))
        return date(year, month, day)
    except ValueError:
        return None


def _to_slash_date(value: date | None) -> str:
    if value is None:
        return ""
    return f"{value.year:04d}/{value.month:02d}/{value.day:02d}"


def _sql_quote(value: str) -> str:
    return "'" + str(value).replace("'", "''") + "'"


def _normalize_text(value: str) -> str:
    return str(value or "").strip()


def _normalize_work_status(value: str) -> str:
    v = _normalize_text(value)
    if v in {"休職", "休職中"}:
        return "休職"
    if v in {"待機", "待機中"}:
        return "待機"
    if v in {"稼働", "稼働中", "派遣", "開発", "陸特"}:
        return "稼働"
    return "稼働" if v else "稼働"


def _normalize_retirement_reason(value: str) -> str:
    v = _normalize_text(value)
    if v == "キャリア":
        return "キャリアアップ"
    if v == "稼働問題":
        return "ITモチベ低下"
    return v


def _weighted_choice(rng: random.Random, items: list[tuple[str, float]]) -> str:
    # items: [(value, weight), ...]
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


def _pick_day_for_join(rng: random.Random) -> int:
    # 日本の入社は「月初」が多い想定
    bucket = rng.random()
    if bucket < 0.72:
        return 1
    if bucket < 0.84:
        return 16
    if bucket < 0.92:
        return 25
    return rng.randint(2, 28)


def _pick_day_for_retire(rng: random.Random, *, year: int, month: int) -> int:
    # 退職は「月末」「月中」が混ざる想定（期末の月末寄り）
    bucket = rng.random()
    if bucket < 0.70:
        return monthrange(year, month)[1]
    if bucket < 0.85:
        return 15
    return _clamp_day(year, month, rng.randint(1, 28))


def _pick_join_date(
    rng: random.Random,
    *,
    start_date: date,
    end_date: date,
) -> date:
    if end_date < start_date:
        return start_date

    years = list(range(start_date.year, end_date.year + 1))
    # 会社の成長を想定して「直近ほど採用が多い」重み
    year_items: list[tuple[str, float]] = []
    for i, y in enumerate(years):
        year_items.append((str(y), (i + 1) ** 1.35))
    year = int(_weighted_choice(rng, year_items))

    # 採用ピーク: 4月（新年度）/10月（下期）
    month_weights = {
        1: 0.4,
        2: 0.35,
        3: 0.8,
        4: 3.2,
        5: 1.2,
        6: 1.0,
        7: 0.6,
        8: 0.45,
        9: 0.8,
        10: 1.7,
        11: 1.0,
        12: 0.9,
    }

    min_month = 1
    max_month = 12
    if year == start_date.year:
        min_month = start_date.month
    if year == end_date.year:
        max_month = end_date.month

    month_items = [(str(m), month_weights[m]) for m in range(min_month, max_month + 1)]
    month = int(_weighted_choice(rng, month_items))

    day = _clamp_day(year, month, _pick_day_for_join(rng))
    picked = date(year, month, day)

    # 端の年/月で範囲外になった場合はクランプ
    if picked < start_date:
        return start_date
    if picked > end_date:
        return end_date
    return picked


def _pick_retire_date(
    rng: random.Random,
    *,
    min_date: date,
    max_date: date,
) -> date:
    if max_date < min_date:
        return min_date

    years = list(range(min_date.year, max_date.year + 1))
    # 退職は年の端に寄りやすい、といった偏りは月側で吸収。年は一旦フラット。
    year_items = [(str(y), 1.0) for y in years]
    year = int(_weighted_choice(rng, year_items))

    # 退職ピーク: 3月（年度末）/6月・12月（賞与後）/9月（半期）
    month_weights = {
        1: 0.7,
        2: 0.6,
        3: 2.8,
        4: 0.6,
        5: 0.7,
        6: 1.6,
        7: 0.7,
        8: 0.7,
        9: 1.3,
        10: 0.8,
        11: 0.8,
        12: 1.9,
    }

    min_month = 1
    max_month = 12
    if year == min_date.year:
        min_month = min_date.month
    if year == max_date.year:
        max_month = max_date.month

    month_items = [(str(m), month_weights[m]) for m in range(min_month, max_month + 1)]
    month = int(_weighted_choice(rng, month_items))

    day = _pick_day_for_retire(rng, year=year, month=month)
    picked = date(year, month, _clamp_day(year, month, day))

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


def generate_synthetic_rows(
    *,
    total_count: int,
    start_employee_code: int,
) -> list[CsvEmployeeRow]:
    if total_count <= 0:
        return []

    # 著作物に依存しない、短い固定リストから組み立てる
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

    departments = [
        "経営企画",
        "営業統括",
        "PMO",
        "インフラ",
        "クラウド",
        "セキュリティ",
        "データ基盤",
        "第1開発",
        "第2開発",
        "第3開発",
        "品質保証",
        "コーポレート",
    ]

    clients = [
        "エンタープライズクライアント01",
        "エンタープライズクライアント02",
        "エンタープライズクライアント03",
        "エンタープライズクライアント04",
        "エンタープライズクライアント05",
        "エンタープライズクライアント06",
        "エンタープライズクライアント07",
        "エンタープライズクライアント08",
        "エンタープライズクライアント09",
        "エンタープライズクライアント10",
        "エンタープライズクライアント11",
        "エンタープライズクライアント12",
        "エンタープライズクライアント13",
        "エンタープライズクライアント14",
        "エンタープライズクライアント15",
        "エンタープライズクライアント16",
    ]

    retirement_reasons = [
        "キャリアアップ",
        "同業他社転職",
        "家庭問題",
        "ITモチベ低下",
        "給与不満",
        "会社不信",
    ]

    # ざっくり比率（均等すぎない＆テスト用に退職も一定数いる想定）
    # - 退職: 45%
    # - 稼働: 72% / 待機: 20% / 休職: 8%
    retired_rate = 0.45

    # 「10年の履歴」の想定（要望: 季節や時期の変動・パターン）
    today = date(2026, 3, 2)
    company_start = date(2016, 4, 1)

    rng = random.Random(404)  # 再現性のため固定

    rows: list[CsvEmployeeRow] = []
    for index in range(total_count):
        employee_code = str(start_employee_code + index)
        is_female = rng.random() < 0.38
        gender = "女性" if is_female else "男性"

        surname = surnames[index % len(surnames)]
        given = (
            given_female[(index // 2) % len(given_female)]
            if is_female
            else given_male[(index // 2) % len(given_male)]
        )
        full_name = f"{surname}{given}"[:50]

        # 生年月日: 1978-01-01 〜 2003-12-31 あたりをゆるく散らす
        birth_base = date(1978, 1, 1)
        birth_span_days = int(26.0 * 365)
        birth_date = birth_base + timedelta(days=rng.randrange(birth_span_days))

        # 入社日: 会社開始〜今日まで（季節性あり）
        join_date = _pick_join_date(rng, start_date=company_start, end_date=today)

        is_retired = rng.random() < retired_rate
        retire_date: date | None
        retirement_reason_name: str
        employment_status: str

        if is_retired:
            # 退職日は入社日より後（最短3ヶ月）で、季節性（年度末/賞与後/半期）を持たせる
            min_retire = join_date + timedelta(days=90)
            max_retire = today
            retire_date = _pick_retire_date(
                rng, min_date=min_retire, max_date=max_retire
            )
            retirement_reason_name = retirement_reasons[
                rng.randrange(len(retirement_reasons))
            ]
            employment_status = "退職"
        else:
            retire_date = None
            retirement_reason_name = ""
            employment_status = "在籍"

        work_bucket = rng.random()
        if work_bucket < 0.72:
            work_status_text = "稼働"
        elif work_bucket < 0.92:
            work_status_text = "待機"
        else:
            work_status_text = "休職"

        # 部署は偏りを作る（開発系が多め）
        department_items: list[tuple[str, float]] = []
        for d in departments:
            weight = 1.0
            if d in {
                "第1開発",
                "第2開発",
                "第3開発",
                "データ基盤",
                "クラウド",
                "インフラ",
            }:
                weight = 1.8
            if d in {"経営企画", "コーポレート"}:
                weight = 0.7
            department_items.append((d, weight))
        department_name = _weighted_choice(rng, department_items)

        # 稼働でない場合はクライアント無しに寄せる
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
                retire_date_text=_to_slash_date(retire_date),
                retirement_reason_name=retirement_reason_name,
                note="",
            )
        )

    return rows


def _read_employee_csv(path: Path) -> list[CsvEmployeeRow]:
    rows: list[CsvEmployeeRow] = []
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.reader(f)
        _header = next(reader, None)
        for raw in reader:
            if not raw or all(not str(c).strip() for c in raw):
                continue
            cols = list(raw) + [""] * (12 - len(raw))
            rows.append(
                CsvEmployeeRow(
                    full_name=_normalize_text(cols[0]),
                    gender=_normalize_text(cols[1]),
                    birth_date_text=_normalize_text(cols[2]),
                    employee_code=_normalize_text(cols[3]),
                    department_name=_normalize_text(cols[4]) or "未所属",
                    join_date_text=_normalize_text(cols[5]),
                    employment_status=_normalize_text(cols[6]),
                    work_status_text=_normalize_text(cols[7]),
                    client_name=_normalize_text(cols[8]),
                    retire_date_text=_normalize_text(cols[9]),
                    retirement_reason_name=_normalize_text(cols[10]),
                    note=_normalize_text(cols[11]),
                )
            )
    return rows


def _make_variant_name(base_name: str, variant_index: int) -> str:
    # なるべく「人名っぽさ」を残したいので、数字は控えめに末尾へ。
    if variant_index <= 0:
        name = base_name
    else:
        name = f"{base_name}（{variant_index}）"

    # employees.full_name は VARCHAR(50)
    return name[:50]


def _shift_date_text(value: str, day_shift: int) -> str:
    parsed = _parse_slash_date(value)
    if not parsed:
        return value
    shifted = parsed + timedelta(days=day_shift)
    return _to_slash_date(shifted)


def expand_rows(
    base_rows: list[CsvEmployeeRow],
    *,
    total_count: int,
    start_employee_code: int,
) -> list[CsvEmployeeRow]:
    if total_count <= 0:
        return []
    if not base_rows:
        raise ValueError("base_rows is empty")

    expanded: list[CsvEmployeeRow] = []
    base_len = len(base_rows)

    for index in range(total_count):
        base = base_rows[index % base_len]
        variant_index = index // base_len

        employee_code = str(start_employee_code + index)
        full_name = _make_variant_name(base.full_name or "テスト社員", variant_index)

        # ほんの少しだけ日付をずらして「同一人物の複製感」を弱める
        shift = (index % 29) - 14  # -14..+14
        birth_date_text = _shift_date_text(base.birth_date_text, shift)
        join_date_text = _shift_date_text(base.join_date_text, shift)
        retire_date_text = _shift_date_text(base.retire_date_text, shift)

        # 退職日が入社日より前になるのを防ぐ（最低限）
        join_d = _parse_slash_date(join_date_text)
        retire_d = _parse_slash_date(retire_date_text)
        if join_d and retire_d and retire_d < join_d:
            retire_date_text = _to_slash_date(join_d)

        expanded.append(
            CsvEmployeeRow(
                full_name=full_name,
                gender=base.gender,
                birth_date_text=birth_date_text,
                employee_code=employee_code,
                department_name=base.department_name or "未所属",
                join_date_text=join_date_text,
                employment_status=base.employment_status,
                work_status_text=base.work_status_text,
                client_name=base.client_name,
                retire_date_text=retire_date_text,
                retirement_reason_name=base.retirement_reason_name,
                note=base.note,
            )
        )

    return expanded


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
) -> str:
    # src_raw: DDL_test2 と同じ列順に寄せる（後段で normalized/prepared を作るため）
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
                    _sql_quote(_normalize_work_status(row.work_status_text)),
                    _sql_quote(row.client_name),
                    _sql_quote(row.retire_date_text),
                    _sql_quote(
                        _normalize_retirement_reason(row.retirement_reason_name)
                    ),
                    _sql_quote(row.note),
                ]
            )
            + ")"
        )

    values_sql = ",\n".join(src_values_lines)

    # departments に code が無いので、DDL_test2 を現行スキーマに合わせて修正している
    return f"""-- ==========================================
-- 生成SQL: DDL_test4_generated_3000.sql
-- 生成元: scripts/tools/generate_test4_seed_sql_from_employee_csv.py
-- 前提: docs/DDL/DDL_main1.sql -> docs/DDL/DDL_main2.sql 実行済み
-- 目的: テストカンパニー4へ社員データ（大量）を投入する
-- ==========================================

-- ログイン情報メモ（このSQLで users に作成されます）
-- 管理者: {admin_email} / {login_password}
-- 一般  : {viewer_email} / {login_password}

BEGIN;

-- 0) 固定パラメータ
DROP TABLE IF EXISTS seed_params_test4_gen;
CREATE TEMP TABLE seed_params_test4_gen ON COMMIT DROP AS
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
FROM seed_params_test4_gen p
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
ensure_departments AS (
  INSERT INTO departments (company_id, name)
  SELECT
    p.company_id,
    src.department_name
  FROM seed_params_test4_gen p
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
  FROM seed_params_test4_gen p
  CROSS JOIN (SELECT DISTINCT client_name FROM prepared WHERE client_name IS NOT NULL) src
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
  JOIN seed_params_test4_gen p ON TRUE
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
)
INSERT INTO users (company_id, employee_id, email, password, role)
SELECT
  p.company_id,
  e.id,
  u.email,
  p.login_password,
  u.role
FROM seed_params_test4_gen p
JOIN (
    SELECT 'admin'::text AS role, p.admin_employee_code AS employee_code, p.admin_email AS email
    FROM seed_params_test4_gen p
    UNION ALL
    SELECT 'general'::text AS role, p.viewer_employee_code AS employee_code, p.viewer_email AS email
    FROM seed_params_test4_gen p
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

-- 確認用（実行後に必要なら）
-- SELECT COUNT(*) AS employee_count FROM employees e JOIN departments d ON d.id = e.department_id WHERE d.company_id = '{company_id}';
-- SELECT email, role, employee_id FROM users WHERE company_id = '{company_id}';
"""


def _iter_existing_fixture_csvs(repo_root: Path) -> Iterable[Path]:
    # 互換のために残すが、デフォルトでは使用しない（Reachデータに依存しない）
    base_dir = repo_root / "src" / "shared" / "data" / "ｃｓｖ一括登録用テストデータ"
    yield base_dir / "Reachemployees.csv"
    yield base_dir / "旧Reachemployees.csv"


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "CSV（Reachemployees/旧Reachemployees）を読み込み、テストカンパニー4用の大量投入SQLを生成します。"
        )
    )
    parser.add_argument(
        "--count",
        type=int,
        default=3000,
        help="生成する社員数（デフォルト: 3000）",
    )
    parser.add_argument(
        "--start-employee-code",
        type=int,
        default=46000001,
        help="社員IDの開始値（デフォルト: 46000001）",
    )
    parser.add_argument(
        "--company-id",
        type=str,
        default="44444444-4444-4444-4444-444444444444",
        help="投入先会社ID(UUID)",
    )
    parser.add_argument(
        "--company-name",
        type=str,
        default="株式会社テストカンパニー4",
        help="投入先会社名",
    )
    parser.add_argument(
        "--admin-email",
        type=str,
        default="test4-1@example.com",
        help="管理者メール",
    )
    parser.add_argument(
        "--viewer-email",
        type=str,
        default="test4-2@example.com",
        help="一般メール",
    )
    parser.add_argument(
        "--password",
        type=str,
        default="testpassword1",
        help="ログインパスワード（平文のまま users.password に入れます）",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="docs/DDL/DDL_test4_generated_3000.sql",
        help="出力SQLパス（workspace相対でも可）",
    )
    parser.add_argument(
        "--input",
        action="append",
        default=None,
        help=("入力CSVパス（複数指定可）。省略時はリポジトリ同梱の2CSVを使用します。"),
    )
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parents[2]

    if args.input:
        input_paths = [Path(p) for p in args.input]
        base_rows: list[CsvEmployeeRow] = []
        for p in input_paths:
            resolved = p if p.is_absolute() else (repo_root / p)
            if not resolved.exists():
                raise FileNotFoundError(f"CSV not found: {resolved}")
            base_rows.extend(_read_employee_csv(resolved))

        expanded = expand_rows(
            base_rows,
            total_count=args.count,
            start_employee_code=args.start_employee_code,
        )
        base_rows_count = len(base_rows)
    else:
        expanded = generate_synthetic_rows(
            total_count=args.count,
            start_employee_code=args.start_employee_code,
        )
        base_rows_count = 0

    # ログイン用の2名は必ず先頭2行にする（employee_code固定で users と紐付けるため）
    admin_employee_code = str(args.start_employee_code)
    viewer_employee_code = str(args.start_employee_code + 1)

    if expanded:
        expanded[0] = CsvEmployeeRow(
            **{**expanded[0].__dict__, "employee_code": admin_employee_code}
        )
    if len(expanded) >= 2:
        expanded[1] = CsvEmployeeRow(
            **{**expanded[1].__dict__, "employee_code": viewer_employee_code}
        )

    sql = build_seed_sql(
        company_id=args.company_id,
        company_name=args.company_name,
        admin_email=args.admin_email,
        viewer_email=args.viewer_email,
        login_password=args.password,
        admin_employee_code=admin_employee_code,
        viewer_employee_code=viewer_employee_code,
        src_rows=expanded,
    )

    out_path = Path(args.output)
    resolved_out = out_path if out_path.is_absolute() else (repo_root / out_path)
    resolved_out.parent.mkdir(parents=True, exist_ok=True)
    resolved_out.write_text(sql, encoding="utf-8")

    print(
        f"Wrote SQL: {resolved_out} (employees={len(expanded)}, base_rows={base_rows_count})"
    )


if __name__ == "__main__":
    main()
