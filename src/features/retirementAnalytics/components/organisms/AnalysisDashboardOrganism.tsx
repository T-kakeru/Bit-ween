import { useRef } from "react";
import FilterCard from "@/features/retirementAnalytics/components/organisms/AnalyticsFilterCardOrganism";
import EmployeeTableCard from "@/features/retirementAnalytics/components/organisms/EmployeeTableCardOrganism";
import useAnalysisDashboard from "@/features/retirementAnalytics/hooks/useAnalysisDashboard";
import AnalyticsChartsView from "@/features/retirementAnalytics/components/views/AnalyticsChartsView";

const AnalysisDashboardOrganism = () => {
  const tableAnchorRef = useRef<HTMLDivElement | null>(null);
  const {
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
  } = useAnalysisDashboard({ tableAnchorRef });

  return (
    <div className="analytics-dashboard-layout">
      <FilterCard
        activeTab={activeTab}
        selectedYear={selectedYear}
        statuses={statuses}
        clients={clients}
        clientOptions={clientOptions}
        genders={genders}
        seriesMode={seriesMode}
        onActiveTabChange={handleActiveTabChange}
        onYearSelect={moveToMonthViewByYear}
        onStatusesChange={setStatuses}
        onClientsChange={setClients}
        onGendersChange={setGenders}
        onSeriesModeChange={setSeriesMode}
        seriesButtons={seriesButtons}
        selectedSeriesKey={selectedSeriesKey}
        isAllSelected={isAllSelected}
        onSelectSeries={(seriesKey: string) => handleSelectSeries("filtered", seriesKey)}
        onSelectAllSeries={handleSelectAllSeries}
      />

      <AnalyticsChartsView
        isChartMaximized={isChartMaximized}
        onToggleMaximize={() => setIsChartMaximized((prev) => !prev)}
        chartData={data}
        chartSeriesKeys={displayedSeriesKeys}
        seriesMode={seriesMode}
        axis={axis}
        enableYearTickClick={activeTab === "year"}
        onYearTickClick={moveToMonthViewByYear}
        onBarClick={handleBarClick}
        pieGroups={pieGroups}
        onSliceClick={handleSelectSeries}
      />

      <div ref={tableAnchorRef}>
        <EmployeeTableCard rows={detailRows} subtitle={detailSubtitle} />
      </div>
    </div>
  );
};

export default AnalysisDashboardOrganism;
