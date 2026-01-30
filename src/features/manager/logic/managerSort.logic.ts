import { parseJapaneseMonthToMs, parseSlashDateToMs } from "@/features/manager/logic/dateParsers";
import type { ManagerColumn, ManagerRow } from "@/features/manager/types";

const getSortValue = (row: ManagerRow | null | undefined, column: ManagerColumn | null | undefined): any => {
  if (!row || !column) return null;
  const raw = row[column.key];
  if (raw == null) return null;
  const value = String(raw).trim();
  if (!value || value === "-") return null;

  if (column.type === "number") {
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
  }

  if (column.type === "date") {
    if (column.key === "退職月") return parseJapaneseMonthToMs(value);
    return parseSlashDateToMs(value);
  }

  return value.toLowerCase();
};

export const compareManagerRows = (a: ManagerRow, b: ManagerRow, column: ManagerColumn): number => {
  const aVal = getSortValue(a, column);
  const bVal = getSortValue(b, column);

  if (aVal == null && bVal == null) return 0;
  if (aVal == null) return 1;
  if (bVal == null) return -1;

  if (column.type === "string") {
    return String(aVal).localeCompare(String(bVal), "ja");
  }

  return Number(aVal) - Number(bVal);
};
