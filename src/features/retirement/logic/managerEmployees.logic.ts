// 社員一覧の整形用ロジック

import type { ManagerColumn, ManagerRow } from "@/features/retirement/types";

const isBlankCell = (value: any): boolean => {
  if (value == null) return true;
  const text = String(value).trim();
  if (!text) return true;
  if (text === "-") return true;
  return false;
};

const toIsActive = (employeeLike: any): boolean => {
  const raw = employeeLike?.is_active;
  if (typeof raw === "boolean") return raw;

  // is_active が無い場合は、退職日が空なら在籍扱い
  const retireDate = employeeLike?.["退職日"];
  return isBlankCell(retireDate);
};

export const normalizeEmployeeCell = (value: any): string => {
  if (value == null) return "-";
  if (typeof value === "string" && value.trim() === "") return "-";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^[\/／]+$/.test(trimmed)) return "-";
  }
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

      const isActive = toIsActive(emp);
      (normalized as any).is_active = isActive;

      for (const col of columns ?? []) {
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
