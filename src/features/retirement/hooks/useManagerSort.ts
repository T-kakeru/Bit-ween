import { useCallback, useMemo, useState } from "react";
import { compareManagerRows } from "@/features/retirement/logic/managerSort.logic";
import type { ManagerColumn, ManagerRow } from "@/features/retirement/types";

const useManagerSort = (
  rows: ManagerRow[],
  columns: ManagerColumn[]
) => {
  const [sort, setSort] = useState<any>({ key: null, direction: null });

  const toggleSort = useCallback((key: string) => {
    setSort((prev: any) => {
      if (prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return { key: null, direction: null };
    });
  }, []);

  const sortedRows = useMemo(() => {
    if (!sort.key || !sort.direction) return rows;
    const column = (columns ?? []).find((c) => c.key === sort.key);
    if (!column) return rows;

    const direction = sort.direction === "asc" ? 1 : -1;
    return rows.slice().sort((a, b) => compareManagerRows(a, b, column) * direction);
  }, [columns, rows, sort.direction, sort.key]);

  return useMemo(
    () => ({
      sort,
      sortedRows,
      toggleSort,
    }),
    [sort, sortedRows, toggleSort]
  );
};

export default useManagerSort;
