import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import RetirementAnalyticsFiltersView from "@/features/retirementAnalytics/components/views/RetirementAnalyticsFiltersView";
import AnalyticsSeriesSelector from "@/features/retirementAnalytics/components/molecules/AnalyticsSeriesSelector";
import AnalyticsSubCard from "@/features/retirementAnalytics/components/molecules/AnalyticsSubCard";

const FilterCardView = ({
  activeTab,
  selectedYear,
  statuses,
  clients,
  clientOptions,
  genders,
  seriesMode,
  onActiveTabChange,
  onYearSelect,
  onStatusesChange,
  onClientsChange,
  onGendersChange,
  onSeriesModeChange,
  seriesButtons,
  selectedSeriesKey,
  isAllSelected,
  onSelectSeries,
  onSelectAllSeries,
}) => {
  return (
    <Card className="analytics-layout-card analytics-filter-card">
      <div className="analytics-card-header">
        <Heading level={3}>分析条件・詳細</Heading>
      </div>

      <AnalyticsSubCard className="analytics-filter-subcard">
        <RetirementAnalyticsFiltersView
          activeTab={activeTab}
          selectedYear={selectedYear}
          statuses={statuses}
          clients={clients}
          clientOptions={clientOptions}
          genders={genders}
          seriesMode={seriesMode}
          onActiveTabChange={onActiveTabChange}
          onYearSelect={onYearSelect}
          onStatusesChange={onStatusesChange}
          onClientsChange={onClientsChange}
          onGendersChange={onGendersChange}
          onSeriesModeChange={onSeriesModeChange}
        />
      </AnalyticsSubCard>

      <div className="analytics-series-selector">
        <span className="analytics-filter-label analytics-filter-label--strong">分析軸：詳細</span>
        <AnalyticsSubCard>
          <AnalyticsSeriesSelector
            seriesButtons={seriesButtons}
            selectedSeriesKey={selectedSeriesKey}
            isAllSelected={isAllSelected}
            onSelectSeries={onSelectSeries}
            onSelectAllSeries={onSelectAllSeries}
          />
        </AnalyticsSubCard>
      </div>
    </Card>
  );
};

export default FilterCardView;
