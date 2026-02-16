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

  const clientOptions = useMemo(() => {
    const set = new Set<string>();
    for (const row of rows ?? []) {
      const raw = (row as any)?.["当時のクライアント"] ?? (row as any)?.["稼働先"] ?? (row as any)?.client;
      if (raw == null) continue;
      const value = String(raw).trim();
      if (value === "") continue;
      set.add(value);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ja"));
  }, [rows]);

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
      clientOptions,
      toggleGroup,
      updateDetail,
      resetFilters,
    }),
    [clientOptions, filters, filteredRows, resetFilters, toggleGroup, updateDetail]
  );
};

export default useManagerFilters;
