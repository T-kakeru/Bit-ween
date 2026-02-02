// 退職者分析: データ整備・集計ロジック
// 方針（データ整備の責務分担がしやすいように明文化）
// 1) 退職日: 退職日 > 退職月（YYYY年M月） > 既定日(2024-01-01) で補完
// 1-1) 期間の偏りが強い場合は、可視化用に「直近12ヶ月（現在月を右端）」へ分布し直す
//      - 編集責務を分担しやすいよう、日付の再分布はこの関数内だけで実施
// 2) 部署: raw.部署 があれば優先。無ければ raw.ステータス が「人事/営業/開発/派遣」の場合は部署として解釈
// 2-1) 欠損/未知は index で均等に振り分け（人事も含めて可視化できるようにする）
// 3) ステータス: raw.ステータス が「待機/稼働中/休職中」の場合のみ採用
// 3-1) 欠損/未知は index で均等に振り分け（休職中を含めるため）
// 4) 退職理由: 空欄/未知値は既存カテゴリへ寄せて正規化
// ※ 仮定: 「退職者分析」なので、退職日/退職月/退職理由 が全て空の行（現職想定）は集計対象外
//         ただし、退職日が欠損していても退職月や退職理由があれば対象として期間補完して集計する

export const DEPARTMENTS = ["人事", "営業", "開発", "派遣"];
export const STATUSES = ["待機", "稼働中", "休職中"];
export const REASONS = [
  "キャリアアップ",
  "同業他社転職",
  "家庭問題",
  "ITモチベ低下",
  "給与不満",
  "会社不信",
];

export const REASON_COLORS = {
  キャリアアップ: "#7aa2f7",
  同業他社転職: "#7ccba2",
  家庭問題: "#f0a35e",
  ITモチベ低下: "#9b8df2",
  給与不満: "#98a1b2",
  会社不信: "#8ec7e8",
};
export const DEPARTMENT_COLORS = {
  人事: "#7aa2f7",
  営業: "#7ccba2",
  開発: "#f0a35e",
  派遣: "#9b8df2",
};

const DEFAULT_DEPARTMENT = "営業";
const DEFAULT_STATUS = "稼働中";
// 「その他」を使わない要望のため、未知/空欄は既存カテゴリへ寄せる
// 方針: unknown/空欄は「会社不信」に正規化（理由未設定＝会社への不満として扱う）
const DEFAULT_REASON = "会社不信";
const DEFAULT_DATE = "2024-01-01";
const DISTRIBUTION_MONTHS = 12;
const YEAR_WINDOW_10 = 10;

const DEPARTMENT_SET = new Set(DEPARTMENTS);
const STATUS_SET = new Set(STATUSES);
const REASON_SET = new Set(REASONS);

const pad2 = (value) => String(value).padStart(2, "0");

const normalizeSlashDate = (value) => {
  if (!value || typeof value !== "string") return null;
  const match = value.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!match) return null;
  const [, y, m, d] = match;
  return `${y}-${pad2(m)}-${pad2(d)}`;
};

const normalizeJapaneseMonth = (value) => {
  if (!value || typeof value !== "string") return null;
  const match = value.match(/^(\d{4})年(\d{1,2})月$/);
  if (!match) return null;
  const [, y, m] = match;
  return `${y}-${pad2(m)}-01`;
};

const getRollingMonthStart = (now) => {
  const d = now instanceof Date ? now : new Date();
  return new Date(d.getFullYear(), d.getMonth() - (DISTRIBUTION_MONTHS - 1), 1);
};

// 年表示（過去10年）用に「今年(2026)が多め」になるよう、分析表示だけ日付を現実的に寄せる。
// - JSON自体は変更せず、正規化時にのみ調整する（モックの見え方調整）
// - 未来日にならないよう、今年は当月までに丸める
const adjustOriginalDateForYearView = (ymd, seed, now) => {
  if (!ymd || typeof ymd !== "string" || ymd.length < 10) return ymd;
  const d = now instanceof Date ? now : new Date();
  const nowYear = d.getFullYear();
  const nowMonth = d.getMonth() + 1;

  // 32bitっぽいハッシュ（決定的）
  const s = Number.isFinite(Number(seed)) ? Number(seed) : 0;
  const h = (Math.imul(s + 101, 2654435761) >>> 0) % 100;

  let year;
  // 2026多め: 44% / 2025: 28% / 2024: 16% / 2023: 8% / 2022: 4%
  if (h < 44) year = nowYear;
  else if (h < 72) year = nowYear - 1;
  else if (h < 88) year = nowYear - 2;
  else if (h < 96) year = nowYear - 3;
  else year = nowYear - 4;

  let month;
  if (year === nowYear) {
    // 今年は当月まで（例: 2月まで）
    month = (Math.imul(s + 7, 1597334677) >>> 0) % Math.max(1, nowMonth);
    month = month + 1;
  } else {
    month = ((Math.imul(s + 13, 2246822519) >>> 0) % 12) + 1;
  }

  const day = ymd.slice(8, 10);
  return `${year}-${pad2(month)}-${day}`;
};

const distributeToRollingMonths = (date, index, baseStart) => {
  const base = baseStart instanceof Date ? baseStart : getRollingMonthStart(new Date());
  const day = Number(date?.slice(8, 10)) || 1;
  const offset = index % DISTRIBUTION_MONTHS;
  const distributed = new Date(base.getFullYear(), base.getMonth() + offset, day);
  const y = distributed.getFullYear();
  const m = pad2(distributed.getMonth() + 1);
  const d = pad2(distributed.getDate());
  return `${y}-${m}-${d}`;
};

const normalizeDate = (retirementDate, retirementMonth, index, baseStart) => {
  const normalized =
    normalizeSlashDate(retirementDate) ||
    normalizeJapaneseMonth(retirementMonth) ||
    DEFAULT_DATE;
  return distributeToRollingMonths(normalized, index, baseStart);
};

const normalizeOriginalDate = (retirementDate, retirementMonth) => {
  return (
    normalizeSlashDate(retirementDate) ||
    normalizeJapaneseMonth(retirementMonth) ||
    DEFAULT_DATE
  );
};

const normalizeDepartment = (row, index) => {
  const candidate = row?.部署 ?? row?.部門 ?? row?.department;
  if (DEPARTMENT_SET.has(candidate)) return candidate;
  const fallback = row?.ステータス;
  if (DEPARTMENT_SET.has(fallback)) return fallback;
  // 欠損データは均等に割り当て（データ整備の責務をここに集約）
  return DEPARTMENTS[index % DEPARTMENTS.length] ?? DEFAULT_DEPARTMENT;
};

const normalizeStatus = (row, index) => {
  const candidate = row?.ステータス ?? row?.status;
  if (STATUS_SET.has(candidate)) return candidate;
  if (DEPARTMENT_SET.has(candidate)) return DEFAULT_STATUS;
  // 欠損データは均等に割り当て（休職中を含める）
  return STATUSES[index % STATUSES.length] ?? DEFAULT_STATUS;
};

const normalizeReason = (value) => {
  if (!value || typeof value !== "string" || value.trim() === "") {
    return DEFAULT_REASON;
  }
  if (REASON_SET.has(value)) return value;
  return DEFAULT_REASON;
};

export const normalizeRetirementData = (rows = []) =>
  (() => {
    const baseStart = getRollingMonthStart(new Date());
    return (Array.isArray(rows) ? rows : []).map((row, index) => ({
      ...row,
      id: row?.id ?? index + 1,
      hasRetirementInfo: Boolean(
        (row?.退職日 && String(row.退職日).trim() !== "") ||
          (row?.退職月 && String(row.退職月).trim() !== "") ||
          (row?.退職理由 && String(row.退職理由).trim() !== "")
      ),
      // 年集計は「元の年月（正規化後）」を使い、月集計は「直近12ヶ月（現在月を右端）へ分布した年月」を使う
      retirementDateOriginal: adjustOriginalDateForYearView(
        normalizeOriginalDate(row?.退職日, row?.退職月),
        row?.id ?? index + 1,
        new Date()
      ),
      retirementDate: normalizeDate(row?.退職日, row?.退職月, index, baseStart),
      department: normalizeDepartment(row, index),
      status: normalizeStatus(row, index),
      reason: normalizeReason(row?.退職理由),
    }));
  })();

const buildEmptyBucket = (period, reasons) => {
  const bucket = { period };
  for (const reason of reasons) {
    bucket[reason] = 0;
  }
  return bucket;
};

export const getSeriesKeys = (seriesMode = "reason") =>
  seriesMode === "department" ? DEPARTMENTS : REASONS;

export const getSeriesColors = (seriesMode = "reason") =>
  seriesMode === "department" ? DEPARTMENT_COLORS : REASON_COLORS;

const buildFixedMonthBuckets = (seriesKeys) => {
  const buckets = new Map();
  const base = getRollingMonthStart(new Date());
  for (let i = 0; i < DISTRIBUTION_MONTHS; i += 1) {
    const d = new Date(base.getFullYear(), base.getMonth() + i, 1);
    const period = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
    buckets.set(period, buildEmptyBucket(period, seriesKeys));
  }
  return buckets;
};

const buildFixedYearBuckets = (seriesKeys, windowSize) => {
  const buckets = new Map();
  const maxYear = new Date().getFullYear();
  const startYear = maxYear - (windowSize - 1);
  for (let y = startYear; y <= maxYear; y += 1) {
    const period = String(y);
    buckets.set(period, buildEmptyBucket(period, seriesKeys));
  }
  return buckets;
};

export const buildAnalyticsAggregation = (
  rows = [],
  { axis = "month", department = "ALL", statuses = [], seriesMode = "reason" }
) => {
  const seriesKeys = getSeriesKeys(seriesMode);
  const statusSet = new Set(statuses);

  const filtered = (Array.isArray(rows) ? rows : []).filter((row) => {
    if (!row?.hasRetirementInfo) return false;
    if (department !== "ALL" && row.department !== department) return false;
    if (statusSet.size > 0 && !statusSet.has(row.status)) return false;
    return true;
  });

  // 期間軸は「固定レンジ」を必ず出す（0件でも表示）
  const buckets = axis === "year" ? buildFixedYearBuckets(seriesKeys, YEAR_WINDOW_10) : buildFixedMonthBuckets(seriesKeys);

  for (const row of filtered) {
    const isYear = axis === "year";
    const date = isYear ? row.retirementDateOriginal : row.retirementDate;
    const period = isYear ? date.slice(0, 4) : date.slice(0, 7);
    if (!buckets.has(period)) buckets.set(period, buildEmptyBucket(period, seriesKeys));
    const bucket = buckets.get(period);
    const key = seriesMode === "department" ? row.department : row.reason;
    if (seriesKeys.includes(key)) {
      bucket[key] += 1;
    }
  }

  const data = Array.from(buckets.values()).sort((a, b) => a.period.localeCompare(b.period));

  return {
    data,
    seriesKeys,
    filteredCount: filtered.length,
  };
};
