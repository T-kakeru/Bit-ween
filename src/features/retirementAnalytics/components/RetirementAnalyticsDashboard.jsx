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
  const [activeTab, setActiveTab] = useState("current");
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [statuses, setStatuses] = useState([...STATUSES]);
  const [clients, setClients] = useState([]);
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
    eligibleCountTotal,
    eligibleCountInWindow,
    filteredRowsInWindow,
    axis,
    periodKeys,
    clientOptions,
  } = useRetirementAnalyticsData({
    activeTab,
    selectedYear,
    department: "ALL",
    statuses,
    clients,
    genders,
    seriesMode,
  });

  useEffect(() => {
    if (!Array.isArray(clientOptions) || clientOptions.length === 0) return;
    setClients((prev) => (Array.isArray(prev) && prev.length > 0 ? prev : [...clientOptions]));
  }, [clientOptions]);

  // 該当者一覧に表示する行
  const detailRows = useMemo(
    () => {
      if (isAllSelected) return filteredRowsInWindow;

      return filterAnalyticsRowsBySelection(filteredRowsInWindow, {
        axis,
        seriesMode,
        period: selectedPeriod,
        seriesKey: selectedSeriesKey,
        periodKeys,
      });
    },
    [axis, filteredRowsInWindow, isAllSelected, periodKeys, selectedPeriod, selectedSeriesKey, seriesMode]
  );

  const windowLabel =
    activeTab === "current"
      ? "表示期間（直近12ヶ月）"
      : activeTab === "year"
      ? "表示期間（直近10年）"
      : `${selectedYear}年（1月〜12月）`;

  const detailTitle = isAllSelected
    ? "すべての該当者"
    : selectedSeriesKey
    ? `${selectedSeriesKey}の該当者`
    : "";
  const detailSubtitle = selectedPeriod ? `${formatPeriodLabel(axis, selectedPeriod)}の内訳` : windowLabel;

  const moveToMonthViewByYear = (year) => {
    setSelectedYear(Number(year));
    setActiveTab("month");
    setIsDetailOpen(false);
    setIsAllSelected(false);
    setSelectedSeriesKey("");
    setSelectedPeriod("");
  };

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
        activeTab={activeTab}
        selectedYear={selectedYear}
        statuses={statuses}
        clients={clients}
        clientOptions={clientOptions}
        genders={genders}
        seriesMode={seriesMode}
        onActiveTabChange={(nextTab) => {
          setActiveTab(nextTab);
          setIsDetailOpen(false);
          setIsAllSelected(false);
          setSelectedSeriesKey("");
          setSelectedPeriod("");
        }}
        onYearSelect={moveToMonthViewByYear}
        onStatusesChange={setStatuses}
        onClientsChange={setClients}
        onGendersChange={setGenders}
        onSeriesModeChange={setSeriesMode}
      />

      <RetirementAnalyticsChart
        data={data}
        seriesKeys={seriesKeys}
        seriesMode={seriesMode}
        axis={axis}
        enableYearTickClick={activeTab === "year"}
        onYearTickClick={moveToMonthViewByYear}
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
        <span className="tag-pill">表示項目数: {filteredCountInWindow}件</span>
        <span className="tag-pill">該当人数: {eligibleCountInWindow}人</span>
        <span className="tag-pill">全社員数: {eligibleCountTotal}人</span>
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
