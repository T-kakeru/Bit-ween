import { useState } from "react";
import Card from "@/shared/ui/Card";
import TextCaption from "@/shared/ui/TextCaption";
import RetirementAnalyticsChart from "@/features/retirementAnalytics/components/RetirementAnalyticsChart";
import RetirementAnalyticsFilters from "@/features/retirementAnalytics/components/RetirementAnalyticsFilters";
import useRetirementAnalyticsData from "@/features/retirementAnalytics/hooks/useRetirementAnalyticsData";
import { STATUSES } from "@/features/retirementAnalytics/logic/retirementAnalytics.logic";

const RetirementAnalyticsDashboard = () => {
  const [axis, setAxis] = useState("month");
  const [department, setDepartment] = useState("ALL");
  const [statuses, setStatuses] = useState([...STATUSES]);
  const [seriesMode, setSeriesMode] = useState("reason");

  const { data, seriesKeys, filteredCount, eligibleCount } = useRetirementAnalyticsData({
    axis,
    department,
    statuses,
    seriesMode,
  });

  return (
    <Card className="analytics-panel">
      <div className="analytics-panel-header">
        <TextCaption className="analytics-note">
          退職日が空欄のデータは「退職月」または既定日で補完し、分析用に直近12ヶ月へ分布。部署/ステータス/理由は固定候補へ正規化し、欠損分は均等に割り当てています。
        </TextCaption>
      </div>

      <RetirementAnalyticsFilters
        axis={axis}
        department={department}
        statuses={statuses}
        seriesMode={seriesMode}
        onAxisChange={setAxis}
        onDepartmentChange={setDepartment}
        onStatusesChange={setStatuses}
        onSeriesModeChange={setSeriesMode}
        filteredCount={filteredCount}
        totalCount={eligibleCount}
      />

      <RetirementAnalyticsChart
        data={data}
        seriesKeys={seriesKeys}
        seriesMode={seriesMode}
        axis={axis}
      />
    </Card>
  );
};

export default RetirementAnalyticsDashboard;
