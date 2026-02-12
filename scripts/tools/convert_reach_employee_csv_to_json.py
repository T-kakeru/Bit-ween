from __future__ import annotations

import argparse
import csv
import json
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class ParsedDate:
    year: int
    month: int
    day: int


def parse_slash_date(value: str) -> ParsedDate | None:
    raw = str(value or "").strip()
    if not raw or raw in {"-", "ー"}:
        return None
    normalized = raw.replace("/", "-")
    parts = normalized.split("-")
    if len(parts) != 3:
        return None
    try:
        y, m, d = (int(parts[0]), int(parts[1]), int(parts[2]))
    except ValueError:
        return None

    if y <= 0 or m <= 0 or d <= 0:
        return None
    try:
        _ = date(y, m, d)
    except ValueError:
        return None
    return ParsedDate(year=y, month=m, day=d)


def build_retire_month_label(retire_date: str) -> str:
    parsed = parse_slash_date(retire_date)
    if not parsed:
        return "-"
    return f"{parsed.year}年{parsed.month}月"


def diff_months(start: ParsedDate, end: ParsedDate) -> int:
    base = (end.year - start.year) * 12 + (end.month - start.month)
    return base - 1 if end.day < start.day else base


def build_tenure_months(join_date: str, retire_date: str) -> int | str:
    join_parsed = parse_slash_date(join_date)
    retire_parsed = parse_slash_date(retire_date)
    if not join_parsed or not retire_parsed:
        return "-"
    if (retire_parsed.year, retire_parsed.month, retire_parsed.day) < (
        join_parsed.year,
        join_parsed.month,
        join_parsed.day,
    ):
        return "-"
    return diff_months(join_parsed, retire_parsed)


def normalize_text(value: str) -> str:
    return str(value or "").strip()


def normalize_client(value: str) -> str:
    v = normalize_text(value)
    return "-" if v in {"", "-", "ー"} else v


def normalize_gender(value: str) -> str:
    v = normalize_text(value)
    if v in {"男性", "女性", "その他"}:
        return v
    return v or "-"


def convert_rows(csv_path: Path) -> list[dict[str, Any]]:
    employees: list[dict[str, Any]] = []

    with csv_path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.reader(f)
        _header = next(reader, None)

        for index, row in enumerate(reader, start=1):
            if not row or all(not str(c).strip() for c in row):
                continue

            # 想定: 氏名,入社日,退職日,稼働状態,退職理由,稼働先,性別,...
            name = normalize_text(row[0] if len(row) > 0 else "")
            join_date = normalize_text(row[1] if len(row) > 1 else "")
            retire_date = normalize_text(row[2] if len(row) > 2 else "")
            status = normalize_text(row[3] if len(row) > 3 else "")
            reason = normalize_text(row[4] if len(row) > 4 else "")
            client = normalize_client(row[5] if len(row) > 5 else "")
            gender = normalize_gender(row[6] if len(row) > 6 else "")

            is_active = False if retire_date not in {"", "-", "ー"} else True
            state = "在籍中" if is_active else "退職済"

            employees.append(
                {
                    "id": index,
                    "退職月": build_retire_month_label(retire_date),
                    "名前": name or "-",
                    "入社日": join_date or "-",
                    "在籍状態": state,
                    "退職日": retire_date or "-",
                    "在籍月数": build_tenure_months(join_date, retire_date),
                    "ステータス": status or "-",
                    "退職理由": reason or "-",
                    "当時のクライアント": client,
                    "性別": gender,
                    # 元CSVに存在しないため、一覧の正規化に任せて "-" 扱い
                    "生年月日": "-",
                    "年齢": "-",
                    "is_active": is_active,
                }
            )

    return employees


def main() -> None:
    parser = argparse.ArgumentParser(description="CSVを一覧互換のJSONへ変換")
    parser.add_argument(
        "--input",
        type=str,
        default=str(Path.home() / "Desktop" / "csv一括登録用データ2.csv"),
        help="入力CSVパス",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="docs/test_data/reach_employee_2.json",
        help="出力JSONパス（workspace相対でも可）",
    )
    args = parser.parse_args()

    in_path = Path(args.input)
    out_path = Path(args.output)

    employees = convert_rows(in_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(
        json.dumps(employees, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    print(f"Wrote {len(employees)} rows -> {out_path}")


if __name__ == "__main__":
    main()
