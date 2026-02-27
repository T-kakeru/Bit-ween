import { useEffect, useMemo, useState } from "react";
import { listEmployees } from "@/services/employee/employeesService";
import {
  buildManagerEmployeeRows,
  computeManagerMetrics,
  normalizeEmployeeCell,
} from "@/features/retirement/logic/managerEmployees.logic";
import { buildManagerEmployeeColumns } from "@/features/retirement/logic/managerEmployeeTableColumns";
import type { ManagerColumn, ManagerRow } from "@/features/retirement/types";

const useManagerEmployees = () => {
  const [employeeList, setEmployeeList] = useState<any[]>([]);

  useEffect(() => {
    let disposed = false;

    const load = async () => {
      const records = await listEmployees();
      if (disposed) return;
      setEmployeeList(Array.isArray(records) ? records : []);
    };

    void load();

    return () => {
      disposed = true;
    };
  }, []);

  const initialColumns: ManagerColumn[] = useMemo(
    () => buildManagerEmployeeColumns(employeeList),
    [employeeList]
  );
  const [rows, setRowsState] = useState<ManagerRow[]>(() =>
    buildManagerEmployeeRows({ employees: employeeList, columns: initialColumns })
  );

  useEffect(() => {
    setRowsState(buildManagerEmployeeRows({ employees: employeeList, columns: initialColumns }));
  }, [employeeList, initialColumns]);

  const setRows = setRowsState;

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
