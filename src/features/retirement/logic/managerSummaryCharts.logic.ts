export type ManagerSummaryCategory = "department" | "status";

type ManagerRow = Record<string, unknown>;

type PieDatum = {
  name: string;
  value: number;
  fill: string;
};

const UNKNOWN_LABEL = "未選択";

const DEPARTMENT_ORDER = ["人事", "営業", "開発", "派遣"];
const STATUS_ORDER = ["待機", "稼働中", "休職中"];

const DEPARTMENT_LIGHT_COLORS: Record<string, string> = {
  人事: "#bfdbfe",
  営業: "#bbf7d0",
  開発: "#ddd6fe",
  派遣: "#fde68a",
  未選択: "#d1d5db",
};

const STATUS_LIGHT_COLORS: Record<string, string> = {
  待機: "#bae6fd",
  稼働中: "#bbf7d0",
  休職中: "#fecdd3",
  未選択: "#d1d5db",
};

const UNKNOWN_INPUTS = new Set(["", "-", "未設定", "未選択", "なし", "N/A"]);

const normalizeCategoryText = (value: unknown) => {
  const text = String(value ?? "").trim();
  if (UNKNOWN_INPUTS.has(text)) return UNKNOWN_LABEL;
  return text;
};

const toSafeRows = (rows: unknown): ManagerRow[] => (Array.isArray(rows) ? (rows as ManagerRow[]) : []);

const resolveDepartment = (row: ManagerRow): string => {
  const candidate = row?.部署 ?? row?.部門 ?? row?.department;
  return normalizeCategoryText(candidate) || UNKNOWN_LABEL;
};

const resolveStatus = (row: ManagerRow): string => {
  const candidate = row?.ステータス ?? row?.status;
  return normalizeCategoryText(candidate) || UNKNOWN_LABEL;
};

const getOrder = (category: ManagerSummaryCategory) =>
  category === "department" ? DEPARTMENT_ORDER : STATUS_ORDER;

const getColorMap = (category: ManagerSummaryCategory) =>
  category === "department" ? DEPARTMENT_LIGHT_COLORS : STATUS_LIGHT_COLORS;

const resolveCategoryLabel = (row: ManagerRow, category: ManagerSummaryCategory): string =>
  category === "department" ? resolveDepartment(row) : resolveStatus(row);

export const buildManagerSummaryPieData = (
  rows: unknown,
  category: ManagerSummaryCategory,
): PieDatum[] => {
  const safeRows = toSafeRows(rows);
  const counter = new Map<string, number>();

  for (const row of safeRows) {
    const key = resolveCategoryLabel(row, category);
    counter.set(key, (counter.get(key) ?? 0) + 1);
  }

  const colorMap = getColorMap(category);
  const order = getOrder(category);

  return Array.from(counter.entries())
    .sort((a, b) => {
      const aIndex = order.indexOf(a[0]);
      const bIndex = order.indexOf(b[0]);
      const normalizedA = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
      const normalizedB = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
      if (normalizedA !== normalizedB) return normalizedA - normalizedB;
      return b[1] - a[1];
    })
    .map(([name, value]) => ({
      name,
      value,
      fill: colorMap[name] ?? colorMap[UNKNOWN_LABEL] ?? "#e5e7eb",
    }));
};
