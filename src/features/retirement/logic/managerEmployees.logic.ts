// 社員一覧の整形用ロジック

import type { ManagerColumn, ManagerRow } from "@/features/retirement/types";

const toIsActive = (value: any): boolean => value !== false;

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

      // 在籍状態の判定は「is_active」を唯一の根拠にする
      const isActive = toIsActive(emp?.is_active);
      (normalized as any).is_active = isActive;

      for (const col of columns ?? []) {
        if (col.key === "在籍状態") {
          normalized[col.key] = isActive ? "在籍中" : "退職済";
          continue;
        }
        normalized[col.key] = normalizeEmployeeCell(emp?.[col.key]);
      }
      return normalized;
    });
};

// 年数を計算するユーティリティ関数
export const computeManagerMetrics = (rows: ManagerRow[] | null | undefined): any => {
  const total = (rows ?? []).length;
  const resigned = (rows ?? []).filter((r) => (r as any)?.is_active === false).length;
  return {
    total,
    resigned,
    active: total - resigned,
  };
};
