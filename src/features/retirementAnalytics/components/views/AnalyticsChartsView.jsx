import TrendChartCard from "@/features/retirementAnalytics/components/organisms/TrendChartCardOrganism";
import SummaryPieCard from "@/features/retirementAnalytics/components/organisms/SummaryPieCardOrganism";

const AnalyticsChartsView = ({
  isChartMaximized,
  onToggleMaximize,
  chartData,
  chartSeriesKeys,
  seriesMode,
  axis,
  enableYearTickClick,
  onYearTickClick,
  onBarClick,
  pieGroups,
  onSliceClick,
}) => {
  return (
    <div className={isChartMaximized ? "analytics-charts-row is-maximized-layout" : "analytics-charts-row"}>
      <div
        className={
          isChartMaximized
            ? "analytics-trend-pane is-maximized transition-all duration-300"
            : "analytics-trend-pane transition-all duration-300"
        }
      >
        <TrendChartCard
          data={chartData}
          seriesKeys={chartSeriesKeys}
          seriesMode={seriesMode}
          axis={axis}
          isChartMaximized={isChartMaximized}
          enableYearTickClick={enableYearTickClick}
          onYearTickClick={onYearTickClick}
          onBarClick={onBarClick}
        />
      </div>

      <SummaryPieCard
        pieGroups={pieGroups}
        isChartMaximized={isChartMaximized}
        onToggleMaximize={onToggleMaximize}
        onSliceClick={onSliceClick}
        layoutMode={isChartMaximized ? "triple-row" : "single"}
      />
    </div>
  );
};

export default AnalyticsChartsView;
