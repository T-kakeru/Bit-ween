import {
  NON_DONUT_LIGHT_COLOR_PALETTE,
  UNKNOWN_CHART_COLOR,
  UNKNOWN_CHART_LABEL,
  getPaletteColorByIndex,
  isUnknownChartLabel,
} from "@/shared/logic/chartColorPalettes";

export type ManagerSummaryCategory =
  | "reason"
  | "department"
  | "age"
  | "tenure"
  | "status"
  | "gender"
  | "client";

type ManagerRow = Record<string, unknown>;

type PieDatum = {
  name: string;
  value: number;
  fill: string;
};

type BuildPieOptions = {
  aggregateOthers?: boolean;
};

const UNKNOWN_INPUTS = new Set(["", "-", "未設定", "未選択", "なし", "N/A"]);
const OTHER_LABEL = "その他";

const AGE_BANDS = ["20未満", "20〜25", "25〜30", "30〜35", "35〜40", "40以上"] as const;
const TENURE_BANDS = [
  "3ヶ月未満",
  "3〜6ヶ月",
  "6〜12ヶ月",
  "12〜18ヶ月",
  "18〜24ヶ月",
  "24〜30ヶ月",
  "30〜36ヶ月",
  "36〜42ヶ月",
  "42ヶ月以上",
] as const;

const normalizeCategoryText = (value: unknown) => {
  const text = String(value ?? "").trim();
  if (UNKNOWN_INPUTS.has(text)) return UNKNOWN_CHART_LABEL;
  return text;
};

const toSafeRows = (rows: unknown): ManagerRow[] => (Array.isArray(rows) ? (rows as ManagerRow[]) : []);

const resolveDepartment = (row: ManagerRow): string => {
  const candidate = row?.部署 ?? row?.部門 ?? row?.department;
  return normalizeCategoryText(candidate) || UNKNOWN_CHART_LABEL;
};

const resolveStatus = (row: ManagerRow): string => {
  const candidate = row?.ステータス ?? row?.status;
  return normalizeCategoryText(candidate) || UNKNOWN_CHART_LABEL;
};

const toSafeNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const resolveAgeBand = (row: ManagerRow): string => {
  const age = toSafeNumber(row?.年齢);
  if (age == null) return UNKNOWN_CHART_LABEL;
  if (age < 20) return AGE_BANDS[0];
  if (age < 25) return AGE_BANDS[1];
  if (age < 30) return AGE_BANDS[2];
  if (age < 35) return AGE_BANDS[3];
  if (age < 40) return AGE_BANDS[4];
  return AGE_BANDS[5];
};

const resolveTenureBand = (row: ManagerRow): string => {
  const months = toSafeNumber(row?.在籍月数);
  if (months == null) return UNKNOWN_CHART_LABEL;
  if (months < 3) return TENURE_BANDS[0];
  if (months < 6) return TENURE_BANDS[1];
  if (months < 12) return TENURE_BANDS[2];
  if (months < 18) return TENURE_BANDS[3];
  if (months < 24) return TENURE_BANDS[4];
  if (months < 30) return TENURE_BANDS[5];
  if (months < 36) return TENURE_BANDS[6];
  if (months < 42) return TENURE_BANDS[7];
  return TENURE_BANDS[8];
};

const resolveReason = (row: ManagerRow): string => {
  const candidate = row?.退職理由 ?? row?.reason;
  return normalizeCategoryText(candidate) || UNKNOWN_CHART_LABEL;
};

const resolveGender = (row: ManagerRow): string => {
  const candidate = row?.性別 ?? row?.gender;
  return normalizeCategoryText(candidate) || UNKNOWN_CHART_LABEL;
};

const resolveClient = (row: ManagerRow): string => {
  const candidate = row?.["当時のクライアント"] ?? row?.稼働先 ?? row?.client;
  return normalizeCategoryText(candidate) || UNKNOWN_CHART_LABEL;
};

const resolveCategoryLabel = (row: ManagerRow, category: ManagerSummaryCategory): string => {
  if (category === "department") return resolveDepartment(row);
  if (category === "status") return resolveStatus(row);
  if (category === "reason") return resolveReason(row);
  if (category === "age") return resolveAgeBand(row);
  if (category === "tenure") return resolveTenureBand(row);
  if (category === "gender") return resolveGender(row);
  return resolveClient(row);
};

const sortEntries = (counter: Map<string, number>) =>
  Array.from(counter.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return String(a[0]).localeCompare(String(b[0]), "ja");
  });

const aggregateToTopNineAndOthers = (entries: Array<[string, number]>) => {
  if (entries.length <= 9) return entries;
  const topNine = entries.slice(0, 9);
  const othersCount = entries.slice(9).reduce((sum, [, count]) => sum + count, 0);
  if (othersCount <= 0) return topNine;
  return [...topNine, [OTHER_LABEL, othersCount] as [string, number]];
};

export const buildManagerSummaryPieData = (
  rows: unknown,
  category: ManagerSummaryCategory,
  options: BuildPieOptions = {},
): PieDatum[] => {
  const safeRows = toSafeRows(rows);
  const counter = new Map<string, number>();

  for (const row of safeRows) {
    const key = resolveCategoryLabel(row, category);
    counter.set(key, (counter.get(key) ?? 0) + 1);
  }

  const sorted = sortEntries(counter);
  const resolvedEntries = options.aggregateOthers ? aggregateToTopNineAndOthers(sorted) : sorted;

  return resolvedEntries
    .map(([name, value], index) => ({
      name,
      value,
      fill:
        name === OTHER_LABEL
          ? getPaletteColorByIndex(9, NON_DONUT_LIGHT_COLOR_PALETTE)
          : isUnknownChartLabel(name)
            ? UNKNOWN_CHART_COLOR
            : getPaletteColorByIndex(index, NON_DONUT_LIGHT_COLOR_PALETTE),
    }));
};
