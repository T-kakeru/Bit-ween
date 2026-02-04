import { useCallback, useMemo, useState } from "react";
import {
  applyManagerFilters,
  DEFAULT_MANAGER_FILTERS,
  DEPARTMENT_OPTIONS,
  REASON_OPTIONS,
} from "@/features/retirement/logic/managerFilters.logic";
import type { ManagerRow } from "@/features/retirement/types";

const useManagerFilters = (rows: ManagerRow[]) => {
  const [filters, setFilters] = useState<any>(DEFAULT_MANAGER_FILTERS);

  const toggleGroup = useCallback((groupKey: string, optionKey: string) => {
    setFilters((prev: any) => {
      const group = prev?.[groupKey] ?? {};
      const current = Boolean(group?.[optionKey]);
      return {
        ...prev,
        [groupKey]: {
          ...group,
          [optionKey]: !current,
        },
      };
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_MANAGER_FILTERS);
  }, []);

  const updateDetail = useCallback((key: string, value: string) => {
    setFilters((prev: any) => ({
      ...prev,
      detail: {
        ...prev.detail,
        [key]: value,
      },
    }));
  }, []);

  const filteredRows = useMemo(() => {
    return applyManagerFilters(rows, filters);
  }, [filters, rows]);

  return useMemo(
    () => ({
      filters,
      filteredRows,
      departmentOptions: DEPARTMENT_OPTIONS,
      reasonOptions: REASON_OPTIONS,
      toggleGroup,
      updateDetail,
      resetFilters,
    }),
    [filters, filteredRows, resetFilters, toggleGroup, updateDetail]
  );
};

export default useManagerFilters;
