import { useMemo, useState } from "react";
import employees from "@/shared/data/mock/retirement.json";
import {
  buildManagerEmployeeRows,
  computeManagerMetrics,
  normalizeEmployeeCell,
} from "@/features/retirement/logic/managerEmployees.logic";
import { MANAGER_EMPLOYEE_COLUMNS } from "@/features/retirement/logic/managerEmployeeTableColumns";
import type { ManagerColumn, ManagerRow } from "@/features/retirement/types";

const COLUMNS: ManagerColumn[] = MANAGER_EMPLOYEE_COLUMNS;

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
