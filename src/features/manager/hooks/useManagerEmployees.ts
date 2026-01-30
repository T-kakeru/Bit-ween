import { useMemo, useState } from "react";
import employees from "@/shared/data/mock/retirement.json";
import {
  buildManagerEmployeeRows,
  computeManagerMetrics,
  normalizeEmployeeCell,
} from "@/features/manager/logic/managerEmployees.logic";
import type { ManagerColumn, ManagerRow } from "@/features/manager/types";

const COLUMNS: ManagerColumn[] = [
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

const useManagerEmployees = () => {
  const employeeList = employees as any;
  const [rows, setRows] = useState<ManagerRow[]>(() =>
    buildManagerEmployeeRows({ employees: employeeList, columns: COLUMNS })
  );

  const metrics = useMemo(() => computeManagerMetrics(rows), [rows]);

  return useMemo(
    () => ({
      columns: COLUMNS,
      rows,
      setRows,
      metrics,
      normalizeCell: normalizeEmployeeCell,
    }),
    [metrics, rows]
  );
};

export default useManagerEmployees;
