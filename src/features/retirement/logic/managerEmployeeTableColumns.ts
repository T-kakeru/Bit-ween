import type { ManagerColumn } from "@/features/retirement/types";

export const MANAGER_EMPLOYEE_COLUMNS: ManagerColumn[] = [
  { key: "社員ID", label: "社員ID", type: "string" },
  { key: "部署", label: "部署", type: "string" },
  { key: "退職月", label: "退職月", type: "string" },
  { key: "名前", label: "名前", type: "string" },
  { key: "入社日", label: "入社日", type: "date" },
  { key: "退職日", label: "退職日", type: "date" },
  { key: "在籍月数", label: "在籍月数", type: "number" },
  { key: "ステータス", label: "稼働状態", type: "string" },
  { key: "退職理由", label: "退職理由", type: "string" },
  { key: "備考", label: "備考", type: "string" },
  // システム上のキーは「当時のクライアント」に統一し、表示は「稼働先」とする
  { key: "当時のクライアント", label: "稼働先", type: "string" },
  { key: "性別", label: "性別", type: "string" },
  { key: "生年月日", label: "生年月日", type: "date" },
  { key: "年齢", label: "年齢", type: "number" },
];

const RESERVED_KEYS = new Set(["id", "is_active", "在籍状態"]);

const COLUMN_LABELS: Record<string, string> = {
  ステータス: "稼働状態",
  当時のクライアント: "稼働先",
};

const inferColumnType = (key: string, rows: Array<Record<string, any>>): string => {
  if (key.endsWith("日")) return "date";
  if (key === "年齢" || key === "在籍月数") return "number";

  const sample = rows
    .map((row) => row?.[key])
    .find((value) => value != null && String(value).trim() !== "");

  if (typeof sample === "number") return "number";

  const text = String(sample ?? "").trim();
  if (/^\d{4}[/-]\d{1,2}[/-]\d{1,2}$/.test(text)) return "date";
  if (/^\d+(\.\d+)?$/.test(text)) return "number";
  return "string";
};

export const buildManagerEmployeeColumns = (employees: Array<Record<string, any>>): ManagerColumn[] => {
  const rows = Array.isArray(employees) ? employees : [];
  const byKey = new Map<string, ManagerColumn>();

  for (const col of MANAGER_EMPLOYEE_COLUMNS) {
    byKey.set(col.key, col);
  }

  for (const row of rows) {
    for (const rawKey of Object.keys(row ?? {})) {
      if (RESERVED_KEYS.has(rawKey)) continue;
      const key = rawKey;
      if (byKey.has(key)) continue;
      byKey.set(key, {
        key,
        label: COLUMN_LABELS[key] ?? key,
        type: inferColumnType(key, rows),
      });
    }
  }

  return Array.from(byKey.values());
};
