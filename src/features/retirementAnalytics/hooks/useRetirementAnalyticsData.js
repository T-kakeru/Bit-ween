import { useEffect, useMemo, useState } from "react";
import { listEmployees } from "@/services/employee/employeesService";
import {
  buildAnalyticsAggregation,
  filterAnalyticsRows,
  getRecentPeriodKeys,
  buildYearMonthPeriodKeys,
  normalizeRetirementData,
} from "@/features/retirementAnalytics/logic/retirementAnalytics.logic";

const getRowPeriodKey = (row, axis) => {
  const date = axis === "year" ? row?.retirementDateOriginal : row?.retirementDate;
  if (!date) return "";
  return axis === "year" ? String(date).slice(0, 4) : String(date).slice(0, 7);
};

const useRetirementAnalyticsData = ({ activeTab, selectedYear, department, statuses, clients, genders, seriesMode }) => {
  const [rawRows, setRawRows] = useState([]);

  useEffect(() => {
    let disposed = false;
    const load = async () => {
      const rows = await listEmployees();
      if (disposed) return;
      setRawRows(Array.isArray(rows) ? rows : []);
    };
    void load();
    return () => {
      disposed = true;
    };
  }, []);

  const normalized = useMemo(() => normalizeRetirementData(rawRows), [rawRows]);

  const clientOptions = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const row of normalized) {
      const value = row?.client;
      if (!value) continue;
      if (seen.has(value)) continue;
      seen.add(value);
      list.push(value);
    }
    return list;
  }, [normalized]);

  const eligible = useMemo(
    () => normalized.filter((row) => Boolean(row?.hasRetirementInfo)),
    [normalized]
  );

  const axis = activeTab === "year" ? "year" : "month";
  const periodKeys = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();

    if (activeTab === "current") return getRecentPeriodKeys("month");
    if (activeTab === "month") return buildYearMonthPeriodKeys(selectedYear ?? currentYear);
    return getRecentPeriodKeys("year");
  }, [activeTab, selectedYear]);

  const recentPeriodSet = useMemo(() => new Set(periodKeys), [periodKeys]);

  const eligibleRowsInWindow = useMemo(
    () => eligible.filter((row) => recentPeriodSet.has(getRowPeriodKey(row, axis))),
    [axis, eligible, recentPeriodSet]
  );

  const filteredRows = useMemo(
    () => filterAnalyticsRows(eligibleRowsInWindow, { department, statuses, clients, genders }),
    [clients, department, eligibleRowsInWindow, genders, statuses]
  );

  const aggregation = useMemo(
    () =>
      buildAnalyticsAggregation(eligible, {
        axis,
        department,
        statuses,
        clients,
        genders,
        seriesMode,
        periodKeys,
      }),
    [axis, clients, department, eligible, genders, periodKeys, seriesMode, statuses]
  );

  return {
    normalizedCount: normalized.length,
    eligibleCountTotal: eligible.length,
    eligibleCountInWindow: eligibleRowsInWindow.length,
    eligibleRowsTotal: eligible,
    eligibleRowsInWindow,// これは軸の期間内に退職した人全員。フィルタリング前の状態
    filteredRowsInWindow: filteredRows,
    data: aggregation.data,
    seriesKeys: aggregation.seriesKeys,
    filteredCountInWindow: aggregation.filteredCount,
    axis,
    periodKeys,
    clientOptions,
  };
};

export default useRetirementAnalyticsData;
