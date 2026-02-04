import { useEffect, useMemo, useRef, useState } from "react";
import Card from "@/shared/ui/Card";
import TextCaption from "@/shared/ui/TextCaption";
import RetirementAnalyticsChart from "@/features/retirementAnalytics/components/RetirementAnalyticsChart";
import RetirementAnalyticsFilters from "@/features/retirementAnalytics/components/RetirementAnalyticsFilters";
import RetirementAnalyticsDetailPanel from "@/features/retirementAnalytics/components/RetirementAnalyticsDetailPanel";
import useRetirementAnalyticsData from "@/features/retirementAnalytics/hooks/useRetirementAnalyticsData";
import {
  STATUSES,
  GENDERS,
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
  const [genders, setGenders] = useState([...GENDERS]);
  const [seriesMode, setSeriesMode] = useState("reason");
  const [selectedSeriesKey, setSelectedSeriesKey] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const detailRef = useRef(null);

  const {
    data,
    seriesKeys,
    filteredCountInWindow,
    eligibleCountInWindow,
    filteredRowsInWindow,
  } = useRetirementAnalyticsData({
    axis,
    department: "ALL",
    statuses,
    genders,
    seriesMode,
  });

  // 該当者一覧に表示する行
  const detailRows = useMemo(
    () => {
      if (isAllSelected) return filteredRowsInWindow;

      return filterAnalyticsRowsBySelection(filteredRowsInWindow, {
        axis,
        seriesMode,
        period: selectedPeriod,
        seriesKey: selectedSeriesKey,
      });
    },
    [axis, filteredRowsInWindow, isAllSelected, selectedPeriod, selectedSeriesKey, seriesMode]
  );

  const windowLabel = axis === "year" ? "表示期間（直近10年）" : "表示期間（直近12ヶ月）";

  const detailTitle = isAllSelected
    ? "すべての該当者"
    : selectedSeriesKey
    ? `${selectedSeriesKey}の該当者`
    : "";
  const detailSubtitle = selectedPeriod ? `${formatPeriodLabel(axis, selectedPeriod)}の内訳` : windowLabel;

  // 
  useEffect(() => {
    if (!isDetailOpen) return;
    const node = detailRef.current;
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "start" });
    if (typeof node.focus === "function") {
      node.focus({ preventScroll: true });
    }
  }, [isDetailOpen, detailRows.length]);

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
        genders={genders}
        seriesMode={seriesMode}
        onAxisChange={setAxis}
        onStatusesChange={setStatuses}
        onGendersChange={setGenders}
        onSeriesModeChange={setSeriesMode}
      />

      <RetirementAnalyticsChart
        data={data}
        seriesKeys={seriesKeys}
        seriesMode={seriesMode}
        axis={axis}
        onBarClick={(seriesKey, period) => {
          if (!seriesKey) return;
          setIsAllSelected(false);
          setSelectedSeriesKey(seriesKey);
          setSelectedPeriod(period ?? "");
          setIsDetailOpen(true);
        }}
        onLegendClick={(seriesKey) => {
          if (!seriesKey) return;
          setIsAllSelected(false);
          setSelectedSeriesKey(seriesKey);
          setSelectedPeriod("");
          setIsDetailOpen(true);
        }}
        onAllClick={() => {
          setIsAllSelected(true);
          setSelectedSeriesKey("");
          setSelectedPeriod("");
          setIsDetailOpen(true);
        }}
      />

      <div className="analytics-bottom-meta">
        <span className="tag-pill">対象: {filteredCountInWindow}件</span>
        <span className="tag-pill">総件数: {eligibleCountInWindow}件</span>
      </div>

      {isDetailOpen && (isAllSelected || selectedSeriesKey) ? (
        <RetirementAnalyticsDetailPanel
          ref={detailRef}
          title={detailTitle}
          subtitle={detailSubtitle}
          rows={detailRows}
          onClose={() => setIsDetailOpen(false)}
        />
      ) : null}
    </Card>
  );
};

export default RetirementAnalyticsDashboard;
