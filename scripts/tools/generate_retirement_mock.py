import json
import os
import random
from datetime import date
from pathlib import Path


def generate_date(start_year: int, end_year: int) -> date:
    year = random.randint(start_year, end_year)
    month = random.randint(1, 12)
    day = random.randint(1, 28)
    return date(year, month, day)


def calculate_months(start: date, end: date) -> int:
    return (end.year - start.year) * 12 + (end.month - start.month)


def add_months(base: date, months: int) -> date:
    year = base.year + (base.month - 1 + months) // 12
    month = (base.month - 1 + months) % 12 + 1
    # Keep it simple and safe for all months
    day = min(base.day, 28)
    return date(year, month, day)


def weighted_choice(items: list[int], weights: list[int]) -> int:
    return random.choices(items, weights=weights, k=1)[0]


def generate_resigned_date(join_date: date, reference_date: date) -> date:
    """Generate a realistic resignation date.

    - Bias toward 2026 (current-year-heavy) while keeping dates plausible.
    - Ensure resigned_date > join_date and <= reference_date.
    """

    # Favor shorter tenures but keep some longer stays
    tenure_months = weighted_choice(
        items=[6, 9, 12, 18, 24, 30, 36, 48, 60],
        weights=[10, 12, 16, 18, 16, 10, 8, 6, 4],
    )
    resigned = add_months(join_date, tenure_months)

    # If it lands after the reference date, pull it back inside the window
    if resigned > reference_date:
        # Put it somewhere in the last ~18 months, still after join_date
        back_months = random.randint(0, 18)
        resigned = add_months(reference_date, -back_months)
        if resigned <= join_date:
            resigned = add_months(join_date, random.randint(6, 18))

    # Randomize day a bit (1-28)
    resigned = date(resigned.year, resigned.month, random.randint(1, 28))
    return resigned


def main() -> None:
    # Reproducible by default (override with SEED env var)
    seed = int(os.getenv("SEED", "42"))
    random.seed(seed)

    num_total = 150
    num_resigned = 50
    # 2026年の月次も多く見せたいので、年内の適当な基準日で生成する
    reference_date = date(2026, 12, 20)

    surnames = [
        "佐藤",
        "鈴木",
        "高橋",
        "田中",
        "渡辺",
        "伊藤",
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
    ]
    first_names_m = [
        "太郎",
        "健一",
        "和也",
        "浩",
        "悟",
        "直樹",
        "賢太",
        "拓真",
        "裕二",
        "誠",
    ]
    first_names_f = [
        "美咲",
        "莉音",
        "恵",
        "陽子",
        "結衣",
        "彩",
        "舞",
        "栞",
        "杏奈",
        "菜々子",
    ]
    # NOTE: この「ステータス」は元データの都合で部署っぽい値も混ざっている
    statuses = ["開発", "派遣", "待機"]
    # アプリ側の分析カテゴリに合わせる（未知カテゴリは作らない）
    resignation_reasons = [
        "ITモチベ低下",
        "家庭問題",
        "同業他社転職",
        "キャリアアップ",
        "給与不満",
        "会社不信",
    ]
    clients = [
        "株式会社システム・ソリューション",
        "ITパートナーズ",
        "グローバルテクノロジー",
        "株式会社ヒト・リンク",
        "テックフュージョン",
        "日本データシステム",
        "ソフトバンク系",
        "大手通信Sier",
    ]

    json_data: list[dict] = []

    # ID 1-50: 退職者
    for i in range(1, num_resigned + 1):
        gender = random.choice(["男性", "女性"])
        fname = random.choice(first_names_m if gender == "男性" else first_names_f)
        dob = generate_date(1980, 2003)
        age = (
            reference_date.year
            - dob.year
            - ((reference_date.month, reference_date.day) < (dob.month, dob.day))
        )
        # 2026年にデータが多めになるよう、入社は近年に寄せる
        join_date = generate_date(2020, 2025)
        resigned_date = generate_resigned_date(join_date, reference_date)

        json_data.append(
            {
                "id": i,
                "退職月": f"{resigned_date.year}年{resigned_date.month}月",
                "名前": f"{random.choice(surnames)} {fname}",
                "入社日": join_date.strftime("%Y/%m/%d"),
                "退職日": resigned_date.strftime("%Y/%m/%d"),
                "在籍月数": calculate_months(join_date, resigned_date),
                "ステータス": random.choice(statuses),
                "退職理由": random.choice(resignation_reasons),
                "当時のクライアント": random.choice(clients),
                "性別": gender,
                "生年月日": dob.strftime("%Y/%m/%d"),
                "年齢": age,
                "学歴point": random.randint(1, 5),
                "経歴point": random.randint(1, 5),
            }
        )

    # ID 51-150: 現職
    for i in range(51, num_total + 1):
        gender = random.choice(["男性", "女性"])
        fname = random.choice(first_names_m if gender == "男性" else first_names_f)
        dob = generate_date(1980, 2004)
        age = (
            reference_date.year
            - dob.year
            - ((reference_date.month, reference_date.day) < (dob.month, dob.day))
        )
        join_date = generate_date(2019, 2026)
        status = random.choice(statuses)

        json_data.append(
            {
                "id": i,
                "退職月": "",
                "名前": f"{random.choice(surnames)} {fname}",
                "入社日": join_date.strftime("%Y/%m/%d"),
                "退職日": "",
                "在籍月数": calculate_months(join_date, reference_date),
                "ステータス": status,
                "退職理由": "",
                "当時のクライアント": (
                    random.choice(clients) if status != "待機" else "-"
                ),
                "性別": gender,
                "生年月日": dob.strftime("%Y/%m/%d"),
                "年齢": age,
                "学歴point": random.randint(1, 5),
                "経歴point": random.randint(1, 5),
            }
        )

    repo_root = Path(__file__).resolve().parents[2]
    out_path = repo_root / "src" / "shared" / "data" / "mock" / "retirement.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)

    # 「休職中」が一定数ある状態を担保（分析フィルタで使えるようにする）
    # 既存要望: 10件程度
    rest_ids = set(random.sample(range(1, num_total + 1), 10))
    for row in json_data:
        if row.get("id") in rest_ids:
            row["ステータス"] = "休職中"

    with out_path.open("w", encoding="utf-8") as f:
        json.dump(json_data, f, indent=2, ensure_ascii=False)

    print(f"Wrote {len(json_data)} records to: {out_path}")
    print(f"Seed: {seed}")


if __name__ == "__main__":
    main()
