// 社員一覧の整形（純ロジック）

import type { ManagerColumn, ManagerRow } from "@/features/manager/types";

export const normalizeEmployeeCell = (value: any): string => {
  if (value == null) return "-";
  if (typeof value === "string" && value.trim() === "") return "-";
  return String(value);
};

// 社員データから表示用の行データを生成
export const buildManagerEmployeeRows = ({ employees, columns }: { employees: any[]; columns: ManagerColumn[] }): ManagerRow[] => {
  const list = Array.isArray(employees) ? employees : [];
  return list
    .slice()
    .sort((a, b) => Number(a?.id ?? 0) - Number(b?.id ?? 0))
    .map((emp) => {
      const normalized: ManagerRow = { id: emp?.id };
      for (const col of columns ?? []) {
        normalized[col.key] = normalizeEmployeeCell(emp?.[col.key]);
      }
      return normalized;
    });
};

// 年数を計算するユーティリティ例
export const computeManagerMetrics = (rows: ManagerRow[] | null | undefined): any => {
  const total = (rows ?? []).length;
  const resigned = (rows ?? []).filter((r) => r["退職日"] !== "-").length;
  return {
    total,
    resigned,
    active: total - resigned,
  };
};
