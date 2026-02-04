import { useMemo, useState } from "react";
import Card from "@/shared/ui/Card";
import TextCaption from "@/shared/ui/TextCaption";
import RetirementAnalyticsChart from "@/features/retirementAnalytics/components/RetirementAnalyticsChart";
import RetirementAnalyticsFilters from "@/features/retirementAnalytics/components/RetirementAnalyticsFilters";
import RetirementAnalyticsDetailPanel from "@/features/retirementAnalytics/components/RetirementAnalyticsDetailPanel";
import useRetirementAnalyticsData from "@/features/retirementAnalytics/hooks/useRetirementAnalyticsData";
import {
  STATUSES,
  filterAnalyticsRowsBySelection,
} from "@/features/retirementAnalytics/logic/retirementAnalytics.logic";

const formatPeriodLabel = (axis, period) => {
  if (!period) return "";
  if (axis === "month") {
    const m = Number(String(period).slice(5, 7));
    return `${m}月`;
  }
  return String(period);
};

const RetirementAnalyticsDashboard = () => {
  const [axis, setAxis] = useState("month");
  const [statuses, setStatuses] = useState([...STATUSES]);
  const [gender, setGender] = useState("");
  const [seriesMode, setSeriesMode] = useState("reason");
  const [selectedSeriesKey, setSelectedSeriesKey] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");

  const { data, seriesKeys, filteredCount, eligibleCount, filteredRows } = useRetirementAnalyticsData({
    axis,
    department: "ALL",
    statuses,
    gender,
    seriesMode,
  });

  const detailRows = useMemo(
    () =>
      filterAnalyticsRowsBySelection(filteredRows, {
        axis,
        seriesMode,
        period: selectedPeriod,
        seriesKey: selectedSeriesKey,
      }),
    [axis, filteredRows, selectedPeriod, selectedSeriesKey, seriesMode]
  );

  const detailTitle = selectedSeriesKey
    ? `${selectedSeriesKey}の該当者`
    : "";
  const detailSubtitle = selectedPeriod
    ? `${formatPeriodLabel(axis, selectedPeriod)}の内訳`
    : "全期間";

  return (
    <Card className="analytics-panel">
      <div className="analytics-panel-header">
        <TextCaption className="analytics-note">
          表と同じ退職日/退職月を元に集計します。バーや下の項目を押すと、同じ絞り込み条件で「該当者一覧（表）」がグラフ下に表示されます。
        </TextCaption>
      </div>

      <RetirementAnalyticsFilters
        axis={axis}
        statuses={statuses}
        gender={gender}
        seriesMode={seriesMode}
        onAxisChange={setAxis}
        onStatusesChange={setStatuses}
        onGenderChange={setGender}
        onSeriesModeChange={setSeriesMode}
        filteredCount={filteredCount}
        totalCount={eligibleCount}
      />

      <RetirementAnalyticsChart
        data={data}
        seriesKeys={seriesKeys}
        seriesMode={seriesMode}
        axis={axis}
        onBarClick={(seriesKey, period) => {
          if (!seriesKey) return;
          setSelectedSeriesKey(seriesKey);
          setSelectedPeriod(period ?? "");
        }}
        onLegendClick={(seriesKey) => {
          if (!seriesKey) return;
          setSelectedSeriesKey(seriesKey);
          setSelectedPeriod("");
        }}
      />

      <div className="analytics-bottom-meta">
        <span className="tag-pill">対象: {filteredCount}件</span>
        <span className="tag-pill">総件数: {eligibleCount}件</span>
      </div>

      {selectedSeriesKey ? (
        <RetirementAnalyticsDetailPanel
          title={detailTitle}
          subtitle={detailSubtitle}
          rows={detailRows}
          onClear={() => {
            setSelectedSeriesKey("");
            setSelectedPeriod("");
          }}
        />
      ) : null}
    </Card>
  );
};

export default RetirementAnalyticsDashboard;
