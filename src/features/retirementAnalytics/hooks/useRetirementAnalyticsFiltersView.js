import { useMemo, useState } from "react";
import { getRecentPeriodKeys } from "@/features/retirementAnalytics/logic/retirementAnalytics.logic";

const useRetirementAnalyticsFiltersView = () => {
  const recentYears = useMemo(() => getRecentPeriodKeys("year"), []);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return {
    recentYears,
    isFilterOpen,
    setIsFilterOpen,
  };
};

export default useRetirementAnalyticsFiltersView;
