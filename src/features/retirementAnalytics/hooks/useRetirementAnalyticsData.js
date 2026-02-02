import { useMemo } from "react";
import rawRetirements from "@/shared/data/mock/retirement.json";
import {
  buildAnalyticsAggregation,
  normalizeRetirementData,
} from "@/features/retirementAnalytics/logic/retirementAnalytics.logic";

const useRetirementAnalyticsData = ({ axis, department, statuses, seriesMode }) => {
  const normalized = useMemo(() => normalizeRetirementData(rawRetirements), []);

  const eligible = useMemo(
    () => normalized.filter((row) => Boolean(row?.hasRetirementInfo)),
    [normalized]
  );

  const aggregation = useMemo(
    () =>
      buildAnalyticsAggregation(eligible, {
        axis,
        department,
        statuses,
        seriesMode,
      }),
    [axis, department, eligible, seriesMode, statuses]
  );

  return {
    normalizedCount: normalized.length,
    eligibleCount: eligible.length,
    data: aggregation.data,
    seriesKeys: aggregation.seriesKeys,
    filteredCount: aggregation.filteredCount,
  };
};

export default useRetirementAnalyticsData;
