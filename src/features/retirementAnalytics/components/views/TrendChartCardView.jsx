import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import RetirementAnalyticsChartMolecule from "@/features/retirementAnalytics/components/molecules/RetirementAnalyticsChartMolecule";
import { buildAxisSummary } from "@/features/retirementAnalytics/logic/retirementAnalyticsFilters.logic";

const TrendChartCardView = ({
  data,
  seriesKeys,
  seriesMode,
  axis,
  isChartMaximized,
  enableYearTickClick,
  onYearTickClick,
  onBarClick,
}) => {
  const axisLabel = buildAxisSummary(seriesMode);

  return (
    <Card className="analytics-layout-card analytics-trend-card transition-all duration-300">
      <div className="analytics-card-title-row">
        <Heading level={3}>
          <span className="analytics-trend-axis-emphasis">{axisLabel}</span>
          <span className="analytics-trend-axis-suffix">の推移</span>
        </Heading>
      </div>

      <RetirementAnalyticsChartMolecule
        data={data}
        seriesKeys={seriesKeys}
        seriesMode={seriesMode}
        axis={axis}
        isChartMaximized={isChartMaximized}
        enableYearTickClick={enableYearTickClick}
        onYearTickClick={onYearTickClick}
        onBarClick={onBarClick}
      />
    </Card>
  );
};

export default TrendChartCardView;
