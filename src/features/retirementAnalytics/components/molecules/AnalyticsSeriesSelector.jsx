import Button from "@/shared/ui/Button";

const AnalyticsSeriesSelector = ({
  seriesButtons,
  selectedSeriesKey,
  isAllSelected,
  onSelectSeries,
  onSelectAllSeries,
}) => {
  const safeSeriesButtons = Array.isArray(seriesButtons) ? seriesButtons.slice(0, 10) : [];
  const isTwoRows = safeSeriesButtons.length > 5;

  return (
    <div className="analytics-series-selector">
      <span className="analytics-filter-label">表示系列</span>
      <div
        className={
          isTwoRows
            ? "manager-filter-tabs manager-filter-tabs--segmented analytics-series-buttons is-two-rows"
            : "manager-filter-tabs manager-filter-tabs--segmented analytics-series-buttons"
        }
        role="group"
        aria-label="表示系列"
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={`manager-filter-tab analytics-series-button ${isAllSelected ? "is-active" : ""}`}
          onClick={onSelectAllSeries}
        >
          <span className="analytics-series-dot" style={{ background: "#0ea5e9" }} />
          すべて
        </Button>

        {safeSeriesButtons.map((item) => (
          <Button
            key={item.key}
            type="button"
            variant="outline"
            size="sm"
            className={`manager-filter-tab analytics-series-button ${!isAllSelected && selectedSeriesKey === item.key ? "is-active" : ""}`}
            onClick={() => onSelectSeries?.(item.key)}
          >
            <span className="analytics-series-dot" style={{ background: item.color }} />
            {item.key}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsSeriesSelector;
