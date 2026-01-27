import { useMemo } from "react";
import employees from "@/shared/data/mock/retirement.json";

const COLUMNS = [
  { key: "退職月", label: "退職月", type: "date" },
  { key: "名前", label: "名前", type: "string" },
  { key: "入社日", label: "入社", type: "date" },
  { key: "退職日", label: "退職", type: "date" },
  { key: "在籍月数", label: "在籍月数", type: "number" },
  { key: "ステータス", label: "ステータス", type: "string" },
  { key: "退職理由", label: "退職理由", type: "string" },
  { key: "当時のクライアント", label: "退職クライアント", type: "string" },
  { key: "性別", label: "性別", type: "string" },
  { key: "生年月日", label: "生年月日", type: "date" },
  { key: "年齢", label: "年齢", type: "number" },
  { key: "学歴point", label: "学歴point", type: "number" },
  { key: "経歴point", label: "経歴point", type: "number" },
];

const normalizeCell = (value) => {
  if (value == null) return "-";
  if (typeof value === "string" && value.trim() === "") return "-";
  return String(value);
};

const useManagerEmployees = () => {
  const rows = useMemo(() => {
    const list = Array.isArray(employees) ? employees : [];
    return list
      .slice()
      .sort((a, b) => Number(a?.id ?? 0) - Number(b?.id ?? 0))
      .map((emp) => {
        const normalized = { id: emp?.id };
        for (const col of COLUMNS) {
          normalized[col.key] = normalizeCell(emp?.[col.key]);
        }
        return normalized;
      });
  }, []);

  const metrics = useMemo(() => {
    const total = rows.length;
    const resigned = rows.filter((r) => r["退職日"] !== "-").length;
    return {
      total,
      resigned,
      active: total - resigned,
    };
  }, [rows]);

  return useMemo(
    () => ({
      columns: COLUMNS,
      rows,
      metrics,
      normalizeCell,
    }),
    [metrics, rows]
  );
};

export default useManagerEmployees;
