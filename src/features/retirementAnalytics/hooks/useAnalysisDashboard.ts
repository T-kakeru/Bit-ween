import { useEffect, useMemo, useState, type RefObject } from "react";
import useRetirementAnalyticsData from "@/features/retirementAnalytics/hooks/useRetirementAnalyticsData";
import { GENDERS, STATUSES, getSeriesColors } from "@/features/retirementAnalytics/logic/retirementAnalytics.logic";
import {
  buildDonutSeriesData,
  buildSeriesButtons,
  formatPeriodLabel,
  getDetailRowsBySelection,
  resolveScopeLabel,
  type SelectionScope,
} from "../logic/analysisDashboard.logic";

type UseAnalysisDashboardArgs = {
  tableAnchorRef: RefObject<HTMLDivElement | null>;
};

const useAnalysisDashboard = ({ tableAnchorRef }: UseAnalysisDashboardArgs) => {
  const [activeTab, setActiveTab] = useState("current");
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [statuses, setStatuses] = useState<string[]>([...STATUSES]);
  const [clients, setClients] = useState<string[]>([]);
  const [genders, setGenders] = useState<string[]>([...GENDERS]);
  const [seriesMode, setSeriesMode] = useState("reason");

  const [selectedSeriesKey, setSelectedSeriesKey] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isChartMaximized, setIsChartMaximized] = useState(false);
  const [selectionScope, setSelectionScope] = useState<SelectionScope>("filtered");

  const {
    data,
    seriesKeys,
    filteredCountInWindow,
    eligibleCountTotal,
    eligibleCountInWindow,
    eligibleRowsTotal,
    eligibleRowsInWindow,
    filteredRowsInWindow,
    axis,
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

  const seriesColors = useMemo(
    () => getSeriesColors(seriesMode) as Record<string, string>,
    [seriesMode]
  );

  const displayedSeriesKeys = useMemo(
    () => (Array.isArray(seriesKeys) ? seriesKeys.slice(0, 10) : []),
    [seriesKeys]
  );

  const seriesButtons = useMemo(
    () => buildSeriesButtons(displayedSeriesKeys, seriesColors),
    [displayedSeriesKeys, seriesColors]
  );

  const sourceRowsForDetail = useMemo(() => {
    if (selectionScope === "eligible-total") return eligibleRowsTotal;
    if (selectionScope === "eligible-window") return eligibleRowsInWindow;
    return filteredRowsInWindow;
  }, [eligibleRowsInWindow, eligibleRowsTotal, filteredRowsInWindow, selectionScope]);

  const detailRows = useMemo(
    () =>
      getDetailRowsBySelection({
        rows: sourceRowsForDetail,
        isAllSelected,
        selectedSeriesKey,
        selectedPeriod,
        axis,
        seriesMode,
      }),
    [axis, isAllSelected, selectedPeriod, selectedSeriesKey, seriesMode, sourceRowsForDetail]
  );

  const pieGroups = useMemo(() => {
    const filteredRows = Array.isArray(filteredRowsInWindow) ? filteredRowsInWindow : [];
    const windowRows = Array.isArray(eligibleRowsInWindow) ? eligibleRowsInWindow : [];
    const totalRows = Array.isArray(eligibleRowsTotal) ? eligibleRowsTotal : [];

    return [
      {
        id: "filtered" as const,
        title: "表示項目数",
        total: filteredRows.length,
        data: buildDonutSeriesData({ rows: filteredRows, seriesMode, seriesColors, displayedSeriesKeys }),
      },
      {
        id: "eligible-window" as const,
        title: "該当人数",
        total: windowRows.length,
        data: buildDonutSeriesData({ rows: windowRows, seriesMode, seriesColors, displayedSeriesKeys }),
      },
      {
        id: "eligible-total" as const,
        title: "全社員数",
        total: totalRows.length,
        data: buildDonutSeriesData({ rows: totalRows, seriesMode, seriesColors, displayedSeriesKeys }),
      },
    ];
  }, [displayedSeriesKeys, eligibleRowsInWindow, eligibleRowsTotal, filteredRowsInWindow, seriesColors, seriesMode]);

  const scrollToTable = () => {
    const target = tableAnchorRef.current;
    if (!target) return;
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const clearSelection = () => {
    setSelectionScope("filtered");
    setIsAllSelected(false);
    setSelectedSeriesKey("");
    setSelectedPeriod("");
  };

  const handleSelectSeries = (scope: SelectionScope, seriesKey: string) => {
    if (seriesKey === "__all__") {
      handleSelectAllSeries();
      return;
    }
    if (!seriesKey) return;
    setSelectionScope(scope);
    setIsAllSelected(false);
    setSelectedSeriesKey(seriesKey);
    setSelectedPeriod("");
    scrollToTable();
  };

  const handleSelectAllSeries = () => {
    setSelectionScope("filtered");
    setIsAllSelected(true);
    setSelectedSeriesKey("");
    setSelectedPeriod("");
    scrollToTable();
  };

  const handleBarClick = (seriesKey: string, period?: string) => {
    if (!seriesKey) return;
    setSelectionScope("filtered");
    setIsAllSelected(false);
    setSelectedSeriesKey(seriesKey);
    setSelectedPeriod(period ?? "");
    scrollToTable();
  };

  const handleActiveTabChange = (nextTab: string) => {
    setActiveTab(nextTab);
    clearSelection();
  };

  const moveToMonthViewByYear = (year: string | number) => {
    setSelectedYear(Number(year));
    setActiveTab("month");
    clearSelection();
  };

  const windowLabel =
    activeTab === "current"
      ? "表示期間（直近12ヶ月）"
      : activeTab === "year"
      ? "表示期間（直近10年）"
      : `${selectedYear}年（1月〜12月）`;

  const detailSubtitle = selectedSeriesKey
    ? `${resolveScopeLabel(selectionScope)} / ${selectedSeriesKey} / ${selectedPeriod ? formatPeriodLabel(axis, selectedPeriod) : windowLabel}`
    : windowLabel;

  return {
    activeTab,
    selectedYear,
    statuses,
    clients,
    clientOptions,
    genders,
    seriesMode,
    selectedSeriesKey,
    isAllSelected,
    isChartMaximized,
    data,
    displayedSeriesKeys,
    axis,
    pieGroups,
    seriesButtons,
    filteredCountInWindow,
    eligibleCountInWindow,
    eligibleCountTotal,
    detailRows,
    detailSubtitle,
    setStatuses,
    setClients,
    setGenders,
    setSeriesMode,
    setIsChartMaximized,
    handleActiveTabChange,
    moveToMonthViewByYear,
    handleSelectSeries,
    handleSelectAllSeries,
    handleBarClick,
  };
};

export default useAnalysisDashboard;
