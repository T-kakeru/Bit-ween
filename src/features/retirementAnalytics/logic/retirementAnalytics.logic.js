// 退職者分析: データ整備・集計ロジック
// 方針（データ整備の責務分担がしやすいように明文化）
// 1) 退職日: 退職日 > 退職月（YYYY年M月） > 既定日(2024-01-01) で補完
// 1-1) 表データとの互換性を優先し、分析は実データの退職日/退職月に合わせる
// 2) 部署: raw.部署 があれば優先。無ければ raw.ステータス が「人事/営業/開発/派遣」の場合は部署として解釈
// 2-1) 欠損/未知は index で均等に振り分け（人事も含めて可視化できるようにする）
// 3) ステータス: raw.ステータス が「待機/稼働中/休職中」の場合のみ採用
// 3-1) 欠損/未知は index で均等に振り分け（休職中を含めるため）
// 4) 退職理由: 空欄/未知値は既存カテゴリへ寄せて正規化
// ※ 仮定: 「退職者分析」なので、退職日/退職月/退職理由 が全て空の行（現職想定）は集計対象外
//         ただし、退職日が欠損していても退職月や退職理由があれば対象として期間補完して集計する

export const DEPARTMENTS = ["人事", "営業", "開発", "派遣"];
export const STATUSES = ["待機", "稼働中", "休職中"];
export const GENDERS = ["男性", "女性"];
export const REASONS = [
  "キャリアアップ",
  "同業他社転職",
  "家庭問題",
  "ITモチベ低下",
  "給与不満",
  "会社不信",
];
export const AGE_BANDS = ["20未満", "20〜25", "25〜30", "30〜35", "35〜40", "40以上"];
export const TENURE_BANDS = [
  "3ヶ月未満",
  "3〜6ヶ月",
  "6〜12ヶ月",
  "12〜18ヶ月",
  "18〜24ヶ月",
  "24〜30ヶ月",
  "30〜36ヶ月",
  "36〜42ヶ月",
  "42ヶ月以上",
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
export const AGE_COLORS = {
  "20未満": "#7aa2f7",
  "20〜25": "#7ccba2",
  "25〜30": "#f0a35e",
  "30〜35": "#9b8df2",
  "35〜40": "#8ec7e8",
  "40以上": "#98a1b2",
};
export const TENURE_COLORS = {
  "3ヶ月未満": "#7aa2f7",
  "3〜6ヶ月": "#7ccba2",
  "6〜12ヶ月": "#f0a35e",
  "12〜18ヶ月": "#9b8df2",
  "18〜24ヶ月": "#8ec7e8",
  "24〜30ヶ月": "#98a1b2",
  "30〜36ヶ月": "#6bb6d6",
  "36〜42ヶ月": "#a8b3c5",
  "42ヶ月以上": "#d1d5db",
};

const DEFAULT_DEPARTMENT = "営業";
const DEFAULT_STATUS = "稼働中";
// 「その他」を使わない要望のため、未知/空欄は既存カテゴリへ寄せる
// 方針: unknown/空欄は「会社不信」に正規化（理由未設定＝会社への不満として扱う）
const DEFAULT_REASON = "会社不信";
const DEFAULT_DATE = "2024-01-01";
const MONTH_WINDOW_12 = 12;
const YEAR_WINDOW_10 = 10;

const DEPARTMENT_SET = new Set(DEPARTMENTS);
const STATUS_SET = new Set(STATUSES);
const REASON_SET = new Set(REASONS);
const GENDER_SET = new Set(GENDERS);

const pad2 = (value) => String(value).padStart(2, "0");

const toMonthKey = (dateString) => String(dateString).slice(0, 7);

const addMonths = (year, month, delta) => {
  const d = new Date(year, month - 1 + delta, 1);
  return { y: d.getFullYear(), m: d.getMonth() + 1 };
};

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



const normalizeDate = (retirementDate, retirementMonth) => {
  return (
    normalizeSlashDate(retirementDate) ||
    normalizeJapaneseMonth(retirementMonth) ||
    DEFAULT_DATE
  );
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

const normalizeGender = (value) => {
  if (!value) return "";
  const normalized = String(value).trim();
  if (normalized === "男") return "男性";
  if (normalized === "女") return "女性";
  if (GENDER_SET.has(normalized)) return normalized;
  return "";
};

const toNumber = (value) => {
  if (value == null || value === "") return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

const toAgeBand = (age) => {
  if (age == null) return null;
  if (age < 20) return "20未満";
  if (age < 25) return "20〜25";
  if (age < 30) return "25〜30";
  if (age < 35) return "30〜35";
  if (age < 40) return "35〜40";
  return "40以上";
};

const toTenureBand = (months) => {
  if (months == null) return null;
  if (months < 3) return "3ヶ月未満";
  if (months < 6) return "3〜6ヶ月";
  if (months < 12) return "6〜12ヶ月";
  if (months < 18) return "12〜18ヶ月";
  if (months < 24) return "18〜24ヶ月";
  if (months < 30) return "24〜30ヶ月";
  if (months < 36) return "30〜36ヶ月";
  if (months < 42) return "36〜42ヶ月";
  return "42ヶ月以上";
};

export const normalizeRetirementData = (rows = []) =>
  (() => {
    return (Array.isArray(rows) ? rows : []).map((row, index) => ({
      ...row,
      id: row?.id ?? index + 1,
      hasRetirementInfo: Boolean(
        (row?.退職日 && String(row.退職日).trim() !== "") ||
          (row?.退職月 && String(row.退職月).trim() !== "") ||
          (row?.退職理由 && String(row.退職理由).trim() !== "")
      ),
      // 年集計は「元の年月（正規化後）」を使う
      retirementDateOriginal: normalizeOriginalDate(row?.退職日, row?.退職月),
      retirementDate: normalizeDate(row?.退職日, row?.退職月),
      department: normalizeDepartment(row, index),
      status: normalizeStatus(row, index),
      reason: normalizeReason(row?.退職理由),
      gender: normalizeGender(row?.性別),
      age: toNumber(row?.年齢),
      tenureMonths: toNumber(row?.["在籍月数"]),
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
  seriesMode === "department"
    ? DEPARTMENTS
    : seriesMode === "age"
    ? AGE_BANDS
    : seriesMode === "tenure"
    ? TENURE_BANDS
    : REASONS;

export const getSeriesColors = (seriesMode = "reason") =>
  seriesMode === "department"
    ? DEPARTMENT_COLORS
    : seriesMode === "age"
    ? AGE_COLORS
    : seriesMode === "tenure"
    ? TENURE_COLORS
    : REASON_COLORS;

export const filterAnalyticsRows = (
  rows = [],
  { department = "ALL", statuses = [], gender = "" } = {}
) => {
  const statusSet = new Set(statuses);
  return (Array.isArray(rows) ? rows : []).filter((row) => {
    if (!row?.hasRetirementInfo) return false;
    if (department !== "ALL" && row.department !== department) return false;
    if (statusSet.size > 0 && !statusSet.has(row.status)) return false;
    if (gender && row.gender !== gender) return false;
    return true;
  });
};

export const filterAnalyticsRowsBySelection = (
  rows = [],
  { axis = "month", seriesMode = "reason", period, seriesKey } = {}
) => {
  if (!seriesKey) return [];
  return (Array.isArray(rows) ? rows : []).filter((row) => {
    if (!row?.hasRetirementInfo) return false;

    const key =
      seriesMode === "department"
        ? row.department
        : seriesMode === "age"
        ? toAgeBand(row.age)
        : seriesMode === "tenure"
        ? toTenureBand(row.tenureMonths)
        : row.reason;
    if (key !== seriesKey) return false;

    if (!period) return true;
    const date = axis === "year" ? row.retirementDateOriginal : row.retirementDate;
    const rowPeriod = axis === "year" ? date.slice(0, 4) : date.slice(0, 7);
    return rowPeriod === period;
  });
};

const buildRecentMonthBuckets = (seriesKeys) => {
  const now = new Date();
  const endYear = now.getFullYear();
  const endMonth = now.getMonth() + 1;

  const buckets = new Map();
  // 左→右を「古い→新しい」に揃える（直近12ヶ月）
  for (let offset = MONTH_WINDOW_12 - 1; offset >= 0; offset -= 1) {
    const { y, m } = addMonths(endYear, endMonth, -offset);
    const period = `${y}-${pad2(m)}`;
    buckets.set(period, buildEmptyBucket(period, seriesKeys));
  }
  return buckets;
};

const buildRecentYearBuckets = (seriesKeys) => {
  const now = new Date();
  const endYear = now.getFullYear();
  const startYear = endYear - (YEAR_WINDOW_10 - 1);

  const buckets = new Map();
  for (let y = startYear; y <= endYear; y += 1) {
    const period = String(y);
    buckets.set(period, buildEmptyBucket(period, seriesKeys));
  }
  return buckets;
};

export const buildAnalyticsAggregation = (
  rows = [],
  { axis = "month", department = "ALL", statuses = [], gender = "", seriesMode = "reason" }
) => {
  const seriesKeys = getSeriesKeys(seriesMode);
  const filtered = filterAnalyticsRows(rows, { department, statuses, gender });

  // 期間軸は「直近固定レンジ」を必ず出す（0件でも表示）
  const buckets = axis === "year" ? buildRecentYearBuckets(seriesKeys) : buildRecentMonthBuckets(seriesKeys);

  for (const row of filtered) {
    const isYear = axis === "year";
    const date = isYear ? row.retirementDateOriginal : row.retirementDate;
    const period = isYear ? date.slice(0, 4) : date.slice(0, 7);
    // 固定レンジ外は描画しない（表との互換性は保ちつつ、UIは直近レンジに統一）
    if (!buckets.has(period)) continue;
    const bucket = buckets.get(period);
    const key =
      seriesMode === "department"
        ? row.department
        : seriesMode === "age"
        ? toAgeBand(row.age)
        : seriesMode === "tenure"
        ? toTenureBand(row.tenureMonths)
        : row.reason;
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
