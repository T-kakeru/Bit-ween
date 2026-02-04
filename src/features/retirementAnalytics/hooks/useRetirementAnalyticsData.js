import { useMemo } from "react";
import rawRetirements from "@/shared/data/mock/retirement.json";
import {
  buildAnalyticsAggregation,
  filterAnalyticsRows,
  normalizeRetirementData,
} from "@/features/retirementAnalytics/logic/retirementAnalytics.logic";

const useRetirementAnalyticsData = ({ axis, department, statuses, gender, seriesMode }) => {
  const normalized = useMemo(() => normalizeRetirementData(rawRetirements), []);

  const eligible = useMemo(
    () => normalized.filter((row) => Boolean(row?.hasRetirementInfo)),
    [normalized]
  );

  const filteredRows = useMemo(
    () => filterAnalyticsRows(eligible, { department, statuses, gender }),
    [department, eligible, gender, statuses]
  );

  const aggregation = useMemo(
    () =>
      buildAnalyticsAggregation(eligible, {
        axis,
        department,
        statuses,
        gender,
        seriesMode,
      }),
    [axis, department, eligible, gender, seriesMode, statuses]
  );

  return {
    normalizedCount: normalized.length,
    eligibleCount: eligible.length,
    filteredRows,
    data: aggregation.data,
    seriesKeys: aggregation.seriesKeys,
    filteredCount: aggregation.filteredCount,
  };
};

export default useRetirementAnalyticsData;
