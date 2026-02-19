import { resolveRowSeriesKey } from "@/features/retirementAnalytics/logic/retirementAnalytics.logic";
import {
  DONUT_COLOR_PALETTE,
  UNKNOWN_CHART_COLOR,
  getPaletteColorByIndex,
  isUnknownChartLabel,
} from "@/shared/logic/chartColorPalettes";

export type SelectionScope = "filtered" | "eligible-window" | "eligible-total";
export type AnalyticsAxis = "month" | "year" | string;

export interface EmployeeRow {
  retirementDate: string | Date | null;
  retirementDateOriginal: string | Date | null;
  department?: string;
  age?: number | string | null;
  tenureMonths?: number | string | null;
  reason?: string;
  [key: string]: unknown;
}

export const DEFAULT_SERIES_COLOR = "#cbd5e1";

export const DEFAULT_SCOPE_LABELS: Record<SelectionScope, string> = {
  "eligible-total": "全社員",
  "eligible-window": "対象社員",
  filtered: "該当社員",
};

type PeriodParts = {
  year: number;
  month?: number;
};

type DonutSeriesArgs = {
  rows: EmployeeRow[];
  seriesMode: string;
  displayedSeriesKeys?: string[];
  seriesColors?: Record<string, string>;
};

type DetailRowsArgs = {
  rows: EmployeeRow[];
  isAllSelected: boolean;
  selectedSeriesKey: string;
  selectedPeriod: string;
  axis: string;
  seriesMode: string;
};

const normalizeDateText = (value: string): string => {
  return value
    .trim()
    .replace(/[年月]/g, "-")
    .replace(/日/g, "")
    .replace(/[.\/]/g, "-")
    .replace(/\s+/g, "");
};

const parseDateToPeriodParts = (raw: unknown): PeriodParts | null => {
  if (!raw) return null;

  if (raw instanceof Date) {
    if (Number.isNaN(raw.getTime())) return null;
    return {
      year: raw.getFullYear(),
      month: raw.getMonth() + 1,
    };
  }

  const text = normalizeDateText(String(raw));

  const yearMonthMatch = text.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?$/);
  if (yearMonthMatch) {
    const year = Number(yearMonthMatch[1]);
    const month = Number(yearMonthMatch[2]);
    if (!Number.isNaN(year) && !Number.isNaN(month) && month >= 1 && month <= 12) {
      return { year, month };
    }
  }

  const yearOnlyMatch = text.match(/^(\d{4})$/);
  if (yearOnlyMatch) {
    const year = Number(yearOnlyMatch[1]);
    if (!Number.isNaN(year)) {
      return { year };
    }
  }

  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) {
    return {
      year: parsed.getFullYear(),
      month: parsed.getMonth() + 1,
    };
  }

  return null;
};

const pad2 = (value: number): string => String(value).padStart(2, "0");

export const formatPeriodLabel = (axis: string, period: string): string => {
  if (!period) return "";

  const parsed = parseDateToPeriodParts(period);

  if (axis === "month") {
    if (parsed?.month) {
      return `${parsed.month}月`;
    }
    return String(period);
  }

  if (parsed?.year) {
    return String(parsed.year);
  }

  return String(period);
};

export const getRowPeriodKey = (row: EmployeeRow, axis: string): string => {
  const dateSource = axis === "year" ? row.retirementDateOriginal : row.retirementDate;
  const parsed = parseDateToPeriodParts(dateSource);

  if (!parsed?.year) return "";

  if (axis === "year") {
    return String(parsed.year);
  }

  if (!parsed.month) return "";

  return `${parsed.year}-${pad2(parsed.month)}`;
};

export const buildDonutSeriesData = ({
  rows,
  seriesMode,
  displayedSeriesKeys = [],
  seriesColors = {},
}: DonutSeriesArgs) => {
  const safeRows = Array.isArray(rows) ? rows : [];
  const safeSeries = Array.isArray(displayedSeriesKeys) ? displayedSeriesKeys : [];
  const limitSet = new Set(safeSeries);
  const hasLimit = limitSet.size > 0;
  const counter = new Map<string, number>();

  for (const row of safeRows) {
    const key = resolveRowSeriesKey(row, seriesMode);
    if (!key) continue;
    const normalizedKey = String(key);
    if (hasLimit && !limitSet.has(normalizedKey)) continue;
    counter.set(normalizedKey, (counter.get(normalizedKey) ?? 0) + 1);
  }

  return Array.from(counter.entries())
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], index) => ({
      name,
      value,
      color: isUnknownChartLabel(name)
        ? UNKNOWN_CHART_COLOR
        : (seriesColors[name] ?? getPaletteColorByIndex(index, DONUT_COLOR_PALETTE)),
    }));
};

export const getDetailRowsBySelection = ({
  rows,
  isAllSelected,
  selectedSeriesKey,
  selectedPeriod,
  axis,
  seriesMode,
}: DetailRowsArgs) => {
  const safeRows = Array.isArray(rows) ? rows : [];
  if (isAllSelected || !selectedSeriesKey) return safeRows;

  return safeRows.filter((row) => {
    const rowSeriesKey = resolveRowSeriesKey(row, seriesMode);
    if (rowSeriesKey !== selectedSeriesKey) return false;
    if (!selectedPeriod) return true;
    const rowPeriod = getRowPeriodKey(row, axis);
    return rowPeriod === selectedPeriod;
  });
};

export const buildSeriesButtons = (
  seriesKeys: string[],
  seriesColors: Record<string, string>,
  defaultSeriesColor: string = DEFAULT_SERIES_COLOR,
) =>
  (Array.isArray(seriesKeys) ? seriesKeys : []).slice(0, 10).map((key) => ({
    key,
    color: seriesColors[key] ?? defaultSeriesColor,
  }));

export const resolveScopeLabel = (
  scope: SelectionScope,
  labels: Record<SelectionScope, string> = DEFAULT_SCOPE_LABELS,
) => {
  return labels[scope] ?? labels.filtered;
};
