import { useMemo } from "react";
import rawRetirements from "@/shared/data/mock/employee.json";
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
  const normalized = useMemo(() => normalizeRetirementData(rawRetirements), []);

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
