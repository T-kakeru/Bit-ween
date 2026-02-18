import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import RetirementAnalyticsChartMolecule from "@/features/retirementAnalytics/components/molecules/RetirementAnalyticsChartMolecule";

const TrendChartCardView = ({
  data,
  seriesKeys,
  seriesMode,
  axis,
  enableYearTickClick,
  onYearTickClick,
  onBarClick,
}) => {
  return (
    <Card className="analytics-layout-card analytics-trend-card transition-all duration-300">
      <div className="analytics-card-title-row">
        <Heading level={3}>時系列バーチャート</Heading>
      </div>

      <RetirementAnalyticsChartMolecule
        data={data}
        seriesKeys={seriesKeys}
        seriesMode={seriesMode}
        axis={axis}
        enableYearTickClick={enableYearTickClick}
        onYearTickClick={onYearTickClick}
        onBarClick={onBarClick}
      />
    </Card>
  );
};

export default TrendChartCardView;
