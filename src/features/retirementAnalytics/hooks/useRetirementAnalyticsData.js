import { useMemo } from "react";
import rawRetirements from "@/shared/data/mock/retirement.json";
import {
  buildAnalyticsAggregation,
  filterAnalyticsRows,
  getRecentPeriodKeys,
  normalizeRetirementData,
} from "@/features/retirementAnalytics/logic/retirementAnalytics.logic";

const getRowPeriodKey = (row, axis) => {
  const date = axis === "year" ? row?.retirementDateOriginal : row?.retirementDate;
  if (!date) return "";
  return axis === "year" ? String(date).slice(0, 4) : String(date).slice(0, 7);
};

const useRetirementAnalyticsData = ({ axis, department, statuses, genders, seriesMode }) => {
  const normalized = useMemo(() => normalizeRetirementData(rawRetirements), []);

  const eligible = useMemo(
    () => normalized.filter((row) => Boolean(row?.hasRetirementInfo)),
    [normalized]
  );

  const recentPeriodSet = useMemo(() => new Set(getRecentPeriodKeys(axis)), [axis]);

  const eligibleRowsInWindow = useMemo(
    () => eligible.filter((row) => recentPeriodSet.has(getRowPeriodKey(row, axis))),
    [axis, eligible, recentPeriodSet]
  );

  const filteredRows = useMemo(
    () => filterAnalyticsRows(eligibleRowsInWindow, { department, statuses, genders }),
    [department, eligibleRowsInWindow, genders, statuses]
  );

  const aggregation = useMemo(
    () =>
      buildAnalyticsAggregation(eligible, {
        axis,
        department,
        statuses,
        genders,
        seriesMode,
      }),
    [axis, department, eligible, genders, seriesMode, statuses]
  );

  return {
    normalizedCount: normalized.length,
    eligibleCountInWindow: eligibleRowsInWindow.length,
    filteredRowsInWindow: filteredRows,
    data: aggregation.data,
    seriesKeys: aggregation.seriesKeys,
    filteredCountInWindow: aggregation.filteredCount,
  };
};

export default useRetirementAnalyticsData;
