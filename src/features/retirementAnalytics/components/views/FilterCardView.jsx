import Card from "@/shared/ui/Card";
import TextCaption from "@/shared/ui/TextCaption";
import RetirementAnalyticsFiltersView from "@/features/retirementAnalytics/components/views/RetirementAnalyticsFiltersView";
import AnalyticsSeriesSelector from "@/features/retirementAnalytics/components/molecules/AnalyticsSeriesSelector";

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
        <TextCaption className="analytics-note">
          表と同じ退職日/退職月を元に集計します。バーや凡例を押すと、同じ絞り込み条件で「該当者一覧」を更新します。
        </TextCaption>
      </div>

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

      <AnalyticsSeriesSelector
        seriesButtons={seriesButtons}
        selectedSeriesKey={selectedSeriesKey}
        isAllSelected={isAllSelected}
        onSelectSeries={onSelectSeries}
        onSelectAllSeries={onSelectAllSeries}
      />
    </Card>
  );
};

export default FilterCardView;
