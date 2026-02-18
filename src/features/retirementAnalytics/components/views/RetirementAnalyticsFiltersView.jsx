import { useMemo } from "react";
import Button from "@/shared/ui/Button";
import FilterTabButton from "@/features/retirement/components/molecules/FilterTabButton";
import { GENDERS, STATUSES } from "@/features/retirementAnalytics/logic/retirementAnalytics.logic";
import AnalyticsMultiSelect from "@/features/retirementAnalytics/components/molecules/AnalyticsMultiSelect";
import useRetirementAnalyticsFiltersView from "@/features/retirementAnalytics/hooks/useRetirementAnalyticsFiltersView";

const ActiveTabToggle = ({ value, onChange }) => (
  <div
    className="manager-filter-tabs manager-filter-tabs--segmented analytics-filter-stack analytics-filter-stack--period"
    role="tablist"
    aria-label="集計期間"
  >
    <FilterTabButton id="current" activeId={value} onSelect={onChange}>
      現在
    </FilterTabButton>
    <FilterTabButton id="month" activeId={value} onSelect={onChange}>
      月
    </FilterTabButton>
    <FilterTabButton id="year" activeId={value} onSelect={onChange}>
      年
    </FilterTabButton>
  </div>
);

const SeriesModeToggle = ({ value, onChange }) => (
  <div
    className="manager-filter-tabs manager-filter-tabs--segmented analytics-filter-stack analytics-filter-stack--axis"
    role="tablist"
    aria-label="分析軸"
  >
    <FilterTabButton id="reason" activeId={value} onSelect={onChange}>
      退職理由
    </FilterTabButton>
    <FilterTabButton id="department" activeId={value} onSelect={onChange}>
      部署
    </FilterTabButton>
    <FilterTabButton id="age" activeId={value} onSelect={onChange}>
      年齢
    </FilterTabButton>
    <FilterTabButton id="tenure" activeId={value} onSelect={onChange}>
      在籍月数
    </FilterTabButton>
  </div>
);

const buildStatusLabel = (selected) => {
    if (selected.length === 0) return "稼働状態：未選択";
    if (selected.length === STATUSES.length) return "稼働状態：全て";
    return `稼働状態：${selected.length}件選択`;
};

const buildGenderLabel = (selected) => {
    if (selected.length === 0) return "性別：未選択";
    if (selected.length === GENDERS.length) return "性別：男女";
    return `性別：${selected[0] ?? "未選択"}`;
};

const buildClientLabel = (selected, options) => {
    if (selected.length === 0) return "稼働先：未選択";
    if (selected.length === options.length) return "稼働先：全て";
    return `稼働先：${selected.length}件選択`;
};

const RetirementAnalyticsFiltersView = ({
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
}) => {
  const {
    recentYears,
    isFilterOpen,
    setIsFilterOpen,
  } = useRetirementAnalyticsFiltersView();

  const statusOptions = STATUSES;
  const genderOptions = GENDERS;
  const safeClientOptions = useMemo(() => (Array.isArray(clientOptions) ? clientOptions : []), [clientOptions]);

  return (
    <div className={`analytics-filters-accordion ${isFilterOpen ? "is-open" : ""}`}>
      <button
        type="button"
        className="analytics-filters-accordion-trigger"
        aria-expanded={isFilterOpen}
        onClick={() => setIsFilterOpen((prev) => !prev)}
      >
        <div className="analytics-filter-accordion-top">
          <span className="analytics-filter-label">条件</span>
          <span className="analytics-filter-condition-chip">条件</span>
        </div>
        <span className="analytics-filter-accordion-caret" aria-hidden="true">▾</span>
      </button>

      <div className="analytics-filters-accordion-body" hidden={!isFilterOpen}>
        <div className="analytics-filters">
          <section className="analytics-filter analytics-filter-block analytics-filter--tabs">
            <span className="analytics-filter-label">集計期間</span>
            <ActiveTabToggle value={activeTab} onChange={onActiveTabChange} />
          </section>

          <section className="analytics-filter analytics-filter-block analytics-filter--tabs">
            <span className="analytics-filter-label">分析軸</span>
            <SeriesModeToggle value={seriesMode} onChange={onSeriesModeChange} />
          </section>

          <section className="analytics-filter analytics-filter-block analytics-filter--tabs analytics-filter--conditions">
            <span className="analytics-filter-label">絞り込み条件</span>
            <div className="manager-filter-tabs manager-filter-tabs--segmented analytics-filter-stack analytics-filter-condition-row">
              <AnalyticsMultiSelect
                selected={statuses}
                options={statusOptions}
                onChange={onStatusesChange}
                labelBuilder={buildStatusLabel}
              />
              <AnalyticsMultiSelect
                selected={genders}
                options={genderOptions}
                onChange={onGendersChange}
                labelBuilder={buildGenderLabel}
              />
              <AnalyticsMultiSelect
                selected={clients}
                options={safeClientOptions}
                onChange={onClientsChange}
                labelBuilder={buildClientLabel}
                menuClassName="multi-select-menu multi-select-menu--chunk10"
              />
            </div>

            {activeTab === "month" ? (
              <div className="analytics-year-axis-wrap">
                <span className="analytics-filter-label">年軸</span>
                <div
                  className="manager-filter-tabs manager-filter-tabs--segmented analytics-year-axis"
                  role="group"
                  aria-label="年選択"
                >
                  {recentYears.map((year) => (
                    <Button
                      key={year}
                      type="button"
                      variant="outline"
                      size="sm"
                      className={`manager-filter-tab ${String(selectedYear) === String(year) ? "is-active" : ""}`}
                      aria-pressed={String(selectedYear) === String(year)}
                      onClick={() => onYearSelect?.(year)}
                    >
                      {year}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
};

export default RetirementAnalyticsFiltersView;
