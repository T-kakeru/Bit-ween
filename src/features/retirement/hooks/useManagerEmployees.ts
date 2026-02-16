import { useMemo, useState } from "react";
import employees from "@/shared/data/mock/employee.json";
import {
  buildManagerEmployeeRows,
  computeManagerMetrics,
  normalizeEmployeeCell,
} from "@/features/retirement/logic/managerEmployees.logic";
import { buildManagerEmployeeColumns } from "@/features/retirement/logic/managerEmployeeTableColumns";
import type { ManagerColumn, ManagerRow } from "@/features/retirement/types";

const useManagerEmployees = () => {
  const employeeList = useMemo(() => employees as any, []);
  const initialColumns: ManagerColumn[] = useMemo(
    () => buildManagerEmployeeColumns(employeeList),
    [employeeList]
  );
  const [rows, setRows] = useState<ManagerRow[]>(() =>
    buildManagerEmployeeRows({ employees: employeeList, columns: initialColumns })
  );

  const columns = useMemo(() => buildManagerEmployeeColumns(rows), [rows]);

  const metrics = useMemo(() => computeManagerMetrics(rows), [rows]);

  return useMemo(
    () => ({
      columns,
      rows,
      setRows,
      metrics,
      normalizeCell: normalizeEmployeeCell,
    }),
    [columns, metrics, rows]
  );
};

export default useManagerEmployees;
